<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model {
    protected $fillable = ['name','start','end','active'];

    protected $casts = ['active'=>'boolean'];
    public function spanForDate(\Carbon\Carbon $date, string $tz = 'Europe/Sarajevo'): array
    {
        $start = \Carbon\Carbon::parse($date->toDateString().' '.$this->start, $tz);
        $end   = \Carbon\Carbon::parse($date->toDateString().' '.$this->end,   $tz);
        if ($end->lessThanOrEqualTo($start)) {
            $end->addDay(); // overnight shift
        }
        return [$start, $end]; // in local tz
    }


}
