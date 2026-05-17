<?php

namespace App\Auth;

use MongoDB\Laravel\Auth\PasswordBrokerManager as BasePasswordBrokerManager;

class MongoPasswordBrokerManager extends BasePasswordBrokerManager
{
    /**
     * Create a token repository instance based on the given configuration.
     *
     * @param  array  $config
     * @return \Illuminate\Auth\Passwords\TokenRepositoryInterface
     */
    protected function createTokenRepository(array $config)
    {
        $key = $this->app['config']['app.key'];

        if (str_starts_with($key, 'base64:')) {
            $key = base64_decode(substr($key, 7));
        }

        $connectionName = $config['connection'] ?? $this->app['config']['database.default'];
        $connection = $this->app['db']->connection($connectionName);

        return new MongoDatabaseTokenRepository(
            $connection,
            $app['hash'],
            $config['table'],
            $key,
            $config['expire'],
            $config['throttle'] ?? 0
        );

    }
}
