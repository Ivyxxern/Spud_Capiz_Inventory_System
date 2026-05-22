<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Product extends Model
{
    use HasFactory;

    // 1. Allow these fields to be saved via API requests
    protected $fillable = [
        'name',
        'sku',
        'current_stock',
        'supplier_name',
        'expiration_date',
        'low_stock_threshold',
    ];

    // 2. Helper Scope: Easily fetch items that hit their specific low-stock threshold
    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'low_stock_threshold');
    }

    // 3. Helper Scope: Easily fetch items expiring within the next 30 days
    public function scopeExpiringSoon($query)
    {
        return $query->whereNotNull('expiration_date')
                     ->where('expiration_date', '<=', Carbon::now()->addDays(30))
                     ->where('expiration_date', '>=', Carbon::now());
    }
}
