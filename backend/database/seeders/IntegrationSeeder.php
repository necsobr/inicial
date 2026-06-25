<?php

namespace Database\Seeders;

use App\Models\Integration;
use Illuminate\Database\Seeder;

class IntegrationSeeder extends Seeder
{
    public function run(): void
    {
        Integration::updateOrCreate(
            ['name' => 'Evolution API (WhatsApp)'],
            [
                'description'   => 'Integração com Evolution API para envio de notificações via WhatsApp ao trio da equipe.',
                'url'           => env('EVOLUTION_API_URL', ''),
                'api_key'       => env('EVOLUTION_API_KEY', ''),
                'instance_name' => env('EVOLUTION_INSTANCE_NAME', ''),
                'active'        => false,
                'type'          => 'whatsapp',
            ]
        );

        Integration::updateOrCreate(
            ['name' => 'Asaas (Pagamentos)'],
            [
                'description' => 'Integração com Asaas para cobrança e gestão de pagamentos dos patrocínios.',
                'url' => 'https://api.asaas.com/v3',
                'api_key' => env('ASAAS_API_KEY', ''),
                'active' => false,
                'type' => 'pagamento',
            ]
        );

        Integration::updateOrCreate(
            ['name' => 'Sistema de Impressão'],
            [
                'description' => 'Integração com sistema local de impressão para envio automático dos mapas de referência.',
                'url' => '',
                'api_key' => '',
                'active' => true,
                'type' => 'impressao',
                'config' => [
                    'padrao' => 'l4260',
                    'mapeamento_papel' => [
                        'A4' => 'l4260',
                        'A3' => 'l1455',
                    ],
                    'impressoras' => [
                        [
                            'chave'     => 'l4260',
                            'nome'      => 'Epson L4260',
                            'descricao' => 'Impressora menor (escritório)',
                            'ip'        => '172.16.50.208',
                            'cups_nome' => 'EPSON_L4260_Series',
                        ],
                        [
                            'chave'     => 'l1455',
                            'nome'      => 'Epson L1455',
                            'descricao' => 'Impressora maior (escritório)',
                            'ip'        => '172.16.50.203',
                            'cups_nome' => 'EPSON_L1455_Series',
                        ],
                    ],
                ],
            ]
        );
    }
}
