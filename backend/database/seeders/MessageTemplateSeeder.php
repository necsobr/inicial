<?php

namespace Database\Seeders;

use App\Models\MessageTemplate;
use Illuminate\Database\Seeder;

class MessageTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'key'         => 'lembrete_3_dias',
                'name'        => 'Lembrete 3 dias — Coordenador',
                'description' => 'Enviado ao coordenador quando faltam 3 dias para a reunião sem mapa enviado. Variáveis: {titulo}, {data}.',
                'body'        => "Lembrete AIprint: A reuniao \"{titulo}\" acontece em 3 dias ({data}). Faca o upload do mapa de referencia em PDF no sistema antes do prazo.",
            ],
            [
                'key'         => 'alerta_1_dia',
                'name'        => 'Alerta 1 dia — Trio',
                'description' => 'Enviado ao trio quando falta 1 dia para a reunião e o mapa ainda não foi enviado. Variáveis: {titulo}, {data}.',
                'body'        => "Atencao AIprint: O mapa de referencia da reuniao \"{titulo}\" (amanha, {data}) ainda nao foi enviado pelo coordenador.",
            ],
        ];

        foreach ($templates as $template) {
            MessageTemplate::updateOrCreate(['key' => $template['key']], $template);
        }
    }
}
