<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'current_stock',
        'supplier_name',
        'expiration_date',
        'low_stock_threshold',
        'image_path',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function imageUrl(): Attribute
    {
        return Attribute::get(
            fn () => $this->image_path
                ? asset('storage/' . $this->image_path)
                : null
        );
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'low_stock_threshold');
    }

    public function scopeExpiringSoon($query)
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', Carbon::now()->addDays(30))
            ->where('expiration_date', '>=', Carbon::now());
    }

    public function deleteImageFile(): void
    {
        if ($this->image_path && Storage::disk('public')->exists($this->image_path)) {
            Storage::disk('public')->delete($this->image_path);
        }
    }
}
