<?php

namespace App\Helpers;

use App\Helpers\Response;

trait JsonBodyTrait
{
    protected function getJsonBody(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            Response::error('Cuerpo JSON inválido o vacío');
        }
        return $input;
    }

    protected function parseJsonBody(): array
    {
        return $this->getJsonBody();
    }
}
