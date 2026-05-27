<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::all();
        $lowStockCount = Product::lowStock()->count();
        $expiringCount = Product::expiringSoon()->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'inventory' => $products,
                'dashboard_stats' => [
                    'total_items' => $products->count(),
                    'low_stock_items' => $lowStockCount,
                    'expiring_soon' => $expiringCount,
                ],
            ],
        ], 200);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'current_stock' => 'required|integer|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'expiration_date' => 'nullable|date',
            'low_stock_threshold' => 'required|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validatedData['image_path'] = $request->file('image')->store('products', 'public');
        }

        unset($validatedData['image']);

        $product = Product::create($validatedData);

        return response()->json([
            'status' => 'success',
            'message' => 'Product added successfully.',
            'data' => $product,
        ], 201);
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|unique:products,sku,' . $product->id,
            'current_stock' => 'sometimes|required|integer|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'expiration_date' => 'nullable|date',
            'low_stock_threshold' => 'sometimes|required|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $product->deleteImageFile();
            $validatedData['image_path'] = $request->file('image')->store('products', 'public');
        }

        unset($validatedData['image']);

        $product->update($validatedData);
        $product->refresh();

        if ($product->current_stock <= $product->low_stock_threshold) {
            $webhookUrl = 'http://localhost:5678/webhook-test/cb46ce5a-53e0-4c85-8b20-c640c2bbd555';

            try {
                Http::post($webhookUrl, [
                    'event' => 'low_stock_alert',
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'current_stock' => $product->current_stock,
                    'threshold' => $product->low_stock_threshold,
                    'timestamp' => now()->toIso8601String(),
                ]);
            } catch (\Exception $e) {
                Log::error('n8n Webhook Failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product successfully updated.',
            'data' => $product,
        ], 200);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->deleteImageFile();
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product successfully deleted.',
        ], 200);
    }
}
