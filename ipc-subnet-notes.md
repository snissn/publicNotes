# Creating and testing subnets

Generally following the instruction in https://github.com/consensus-shipyard/ipc/blob/main/docs/ipc/quickstart-calibration.md

## CLI

The following is a way to run the `ipc-cli`:

```shell
cargo run -p ipc-cli --release -- --help
```

Maybe use it with an alias:

```shell
alias ipc-cli="cargo run -q -p ipc-cli --release --"
```

## Config file

Initialize the config file:

```console
❯ cargo run -q -p ipc-cli --release -- config init

[2024-01-25T16:54:13Z INFO  ipc_cli::commands::config::init] Empty config populated successful in /home/aakoshh/.ipc/config.toml

❯ cat ~/.ipc/config.toml

keystore_path = "~/.ipc"

# Filecoin Calibration
[[subnets]]
id = "/r314159"

[subnets.config]
network_type = "fevm"
provider_http = "https://api.calibration.node.glif.io/rpc/v1"
gateway_addr = "0x1AEe8A878a22280fc2753b3C63571C8F895D2FE3"
registry_addr = "0x0b4e239FF21b40120cDa817fba77bD1B366c1bcD"

# Mycelium Calibration
[[subnets]]
id = "/r314159/t410fx23amesh6qvzfzl744uzdr76vlsysb6nnp3us4q"

[subnets.config]
network_type = "fevm"
provider_http = "https://api.mycelium.calibration.node.glif.io/"
gateway_addr = "0x77aa40b105843728088c0132e43fc44348881da8"
registry_addr = "0x74539671a1d2f1c8f200826baba665179f53a1b7"

# Subnet template - uncomment and adjust before using
# [[subnets]]
# id = "/r314159/<SUBNET_ID>"

# [subnets.config]
# network_type = "fevm"
# provider_http = "https://<RPC_ADDR>/"
# gateway_addr = "0x77aa40b105843728088c0132e43fc44348881da8"
# registry_addr = "0x74539671a1d2f1c8f200826baba665179f53a1b7"
```

If the HTTP endpoint doesn't work we can look for alternative ones at https://chainlist.org/chain/314159

The Gateway and Registry addresses are that of already deployed contracts. It can easily happen that these are outdated and won't work with the latest contracts or CLI. We can ask if somebody did a deployment recently, for example in this case Raul just did one yesterday, which I replaced the values under the `r314159` entry with:

```
gateway_addr = "0x7295c3A8d06e8d70e974165348559Cd2B36114e0"
registry_addr = "0xfb921983281AA25040f1f02e3aFd4A0e3e791e43"
```

## Deploying contracts

If there are no working gateways, we have to deploy another instance of IPC stack like so:

```shell
cd contracts && make deploy-ipc NETWORK=calibrationnet
```

It can take a very long time, like an hour.

## Wallets

Now let's create some three wallets, as the docs suggest:

```console
❯ ipc-cli wallet new -w evm
  ipc-cli wallet new -w evm
  ipc-cli wallet new -w evm
[2024-01-26T10:25:38Z INFO  ipc_wallet::evm::persistent] key store does not exist, initialized to empty key store
"0x06a47133d41d0eb523b5b483e5492ea94f87aed3"
"0xb49fe872bf3eda1b611e7881d00257a33084d3a0"
"0x2a0a2424fb8c23cc8043222d586fc2bb5696f69d"
```

Those must be our prospective validators' public keys. Now we have to go to https://faucet.calibration.fildev.network/ and ask for funds for each one. The web form will show what looks like the CID of a transaction.


## Create a subnet

Let's use one of the accounts created above to create a subnet:

```console
❯ ipc-cli subnet create --parent /r314159 --min-validator-stake 1 --min-validators 3 --bottomup-check-period 30 --from 0x06a47133d41d0eb523b5b483e5492ea94f87aed3 --permission-mode 0 --supply-source-kind 0
[2024-01-26T10:32:50Z INFO  ipc_provider::manager::evm::manager] creating subnet on evm with params: ConstructorParams { min_activation_collateral: 1000000000000000000, min_cross_msg_fee: 1000000000000, min_validators: 3, bottom_up_check_period: 30, ipc_gateway_addr: 0x7295c3a8d06e8d70e974165348559cd2b36114e0, active_validators_limit: 100, majority_percentage: 60, consensus: 0, power_scale: 3, permission_mode: 0, supply_source: SupplySource { kind: 0, token_address: 0x0000000000000000000000000000000000000000 }, parent_id: SubnetID { root: 314159, route: [] } }
[2024-01-26T10:33:31Z INFO  ipc_cli::commands::subnet::create] created subnet actor with id: /r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a
```

Great, it created `/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a`

## Join the subnet

The docs say we'll need the public key of our validators to join:

```console
❯ ipc-cli wallet pub-key -w evm --address 0x06a47133d41d0eb523b5b483e5492ea94f87aed3
  ipc-cli wallet pub-key -w evm --address 0xb49fe872bf3eda1b611e7881d00257a33084d3a0
  ipc-cli wallet pub-key -w evm --address 0x2a0a2424fb8c23cc8043222d586fc2bb5696f69d
0413d4e26b3de6c083a9ba1b575fd6afa3c8685a9310083a2878038820aadfb49bddd4e4cec6554380a1a1b124fae6a757cb30a8af09fbf025d03614a0b860a4fb
044573927dd5382235c47934e2d92476448d03b1ce250678640d45855be504bc6562b26c1b8655fe85801226c65d91eac1ba1d22d4e923c724c57f704730378c32
04e07f8b4044d52fbbac29fc7957a37cbbb69bdad8e25eea0dd967e672754a486f1a32f0c3974d0db8946273e6a4600ca7ca8409546dc4d936be86618477e3e50a
```

Then join them.

First validator:
```console
❯ ipc-cli subnet join --from=0x06a47133d41d0eb523b5b483e5492ea94f87aed3 --subnet=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a --collateral=10 --public-key=0413d4e26b3de6c083a9ba1b575fd6afa3c8685a9310083a2878038820aadfb49bddd4e4cec6554380a1a1b124fae6a757cb30a8af09fbf025d03614a0b860a4fb --initial-balance 1
[2024-01-26T10:39:57Z INFO  ipc_cli::commands::subnet::join] pre-funding address with 1
[2024-01-26T10:39:57Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with balance: 1000000000000000000
[2024-01-26T10:40:00Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with collateral: 10000000000000000000
joined at epoch: 1297975
```

Second validator:
```console
❯ ipc-cli subnet join --from=0xb49fe872bf3eda1b611e7881d00257a33084d3a0 --subnet=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a --collateral=10 --public-key=044573927dd5382235c47934e2d92476448d03b1ce250678640d45855be504bc6562b26c1b8655fe85801226c65d91eac1ba1d22d4e923c724c57f704730378c32 --initial-balance 1
[2024-01-26T10:41:31Z INFO  ipc_cli::commands::subnet::join] pre-funding address with 1
[2024-01-26T10:41:31Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with balance: 1000000000000000000
[2024-01-26T10:41:33Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with collateral: 10000000000000000000
joined at epoch: 1297978
```

Third validator:
```console
❯ ipc-cli subnet join --from=0x2a0a2424fb8c23cc8043222d586fc2bb5696f69d --subnet=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a --collateral=10 --public-key=04e07f8b4044d52fbbac29fc7957a37cbbb69bdad8e25eea0dd967e672754a486f1a32f0c3974d0db8946273e6a4600ca7ca8409546dc4d936be86618477e3e50a --initial-balance 1
[2024-01-26T10:43:41Z INFO  ipc_cli::commands::subnet::join] pre-funding address with 1
[2024-01-26T10:43:41Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with balance: 1000000000000000000
[2024-01-26T10:43:43Z INFO  ipc_provider::manager::evm::manager] interacting with evm subnet contract: 0xca36…de5a with collateral: 10000000000000000000
joined at epoch: 1297982
```


## Start validator containers

First we need to export the validator private keys for all or wallets into separate files.

```console
❯ ipc-cli wallet export -w evm -a 0x06a47133d41d0eb523b5b483e5492ea94f87aed3 --hex -o ~/.ipc/validator_1.sk
  ipc-cli wallet export -w evm -a 0xb49fe872bf3eda1b611e7881d00257a33084d3a0 --hex -o ~/.ipc/validator_2.sk
  ipc-cli wallet export -w evm -a 0x2a0a2424fb8c23cc8043222d586fc2bb5696f69d --hex -o ~/.ipc/validator_3.sk
exported new wallet with address "0x06a47133d41d0eb523b5b483e5492ea94f87aed3" in file "/home/aakoshh/.ipc/validator_1.sk"
exported new wallet with address "0xb49fe872bf3eda1b611e7881d00257a33084d3a0" in file "/home/aakoshh/.ipc/validator_2.sk"
exported new wallet with address "0x2a0a2424fb8c23cc8043222d586fc2bb5696f69d" in file "/home/aakoshh/.ipc/validator_3.sk"
```

Let's start our first validator and make it be the one the others will bootstrap from.

I need to disable pulling the published `fendermint` image so we can work with the latest, built locally with `make docker-build`.

```console
cargo make --makefile infra/fendermint/Makefile.toml \
    -e NODE_NAME=validator-1 \
    -e PRIVATE_KEY_PATH=/home/aakoshh/.ipc/validator_1.sk \
    -e SUBNET_ID=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a \
    -e CMT_P2P_HOST_PORT=26656 \
    -e CMT_RPC_HOST_PORT=26657 \
    -e ETHAPI_HOST_PORT=8545 \
    -e RESOLVER_HOST_PORT=26655 \
    -e PARENT_REGISTRY=0xfb921983281AA25040f1f02e3aFd4A0e3e791e43 \
    -e PARENT_GATEWAY=0x7295c3A8d06e8d70e974165348559Cd2B36114e0 \
    -e FM_PULL_SKIP=1 \
    child-validator
```


The output looks like this:

```console
❯ cargo make --makefile infra/fendermint/Makefile.toml \
          -e NODE_NAME=validator-1 \
          -e PRIVATE_KEY_PATH=/home/aakoshh/.ipc/validator_1.sk \
          -e SUBNET_ID=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a \
          -e CMT_P2P_HOST_PORT=26656 \
          -e CMT_RPC_HOST_PORT=26657 \
          -e ETHAPI_HOST_PORT=8545 \
          -e RESOLVER_HOST_PORT=26655 \
          -e PARENT_REGISTRY=0xfb921983281AA25040f1f02e3aFd4A0e3e791e43 \
          -e PARENT_GATEWAY=0x7295c3A8d06e8d70e974165348559Cd2B36114e0 \
          -e FM_PULL_SKIP=1 \
          child-validator
[cargo-make] INFO - cargo make 0.37.8
[cargo-make] INFO - Calling cargo metadata to extract project info
[cargo-make] INFO - Cargo metadata done
[cargo-make] INFO - Build File: infra/fendermint/Makefile.toml
[cargo-make] INFO - Task: child-validator
[cargo-make] INFO - Profile: development
[cargo-make] INFO - Running Task: legacy-migration
[cargo-make] INFO - Execute Command: "docker" "stop" "validator-1-cometbft"
Error response from daemon: No such container: validator-1-cometbft
[cargo-make] INFO - Execute Command: "docker" "rm" "--force" "validator-1-cometbft"
Error response from daemon: No such container: validator-1-cometbft
[cargo-make] INFO - Execute Command: "docker" "stop" "validator-1-fendermint"
Error response from daemon: No such container: validator-1-fendermint
[cargo-make] INFO - Execute Command: "docker" "rm" "--force" "validator-1-fendermint"
Error response from daemon: No such container: validator-1-fendermint
[cargo-make] INFO - Execute Command: "docker" "stop" "validator-1-ethapi"
Error response from daemon: No such container: validator-1-ethapi
[cargo-make] INFO - Execute Command: "docker" "rm" "--force" "validator-1-ethapi"
Error response from daemon: No such container: validator-1-ethapi
[cargo-make] INFO - Execute Command: "docker" "network" "rm" "r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a"
Error response from daemon: network r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a not found
[cargo-make] INFO - Skipping Task: fendermint-pull Skipped pulling fendermint Docker image.
[cargo-make] INFO - Running Task: node-clear
clearing all IPC data
[cargo-make] INFO - Running Task: node-mkdir
creating directories: /home/aakoshh/.ipc/r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a/validator-1 /home/aakoshh/.ipc/r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a/validator-1/validator-1/fendermint /home/aakoshh/.ipc/r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a/validator-1/validator-1/cometbft
[cargo-make] INFO - Execute Command: "docker" "network" "create" "r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a"
713c1543276c4696f169235e551bc35b3694677347b4010b3fc6fa03b6247eff
[cargo-make] INFO - Execute Command: "docker" "pull" "cometbft/cometbft:v0.37.x"
v0.37.x: Pulling from cometbft/cometbft
Digest: sha256:e6220583125171b617e79e112c8fbff5c9c56d569bf53c5faea3b124cf1b432a
Status: Image is up to date for cometbft/cometbft:v0.37.x
docker.io/cometbft/cometbft:v0.37.x
[cargo-make] INFO - Execute Command: "docker" "network" "create" "r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a"
Error response from daemon: network with name r314159-t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a already exists
[cargo-make] INFO - Running Task: cometbft-init
Running cometbft init to create (default) configuration for docker run.
I[2024-01-26|13:37:32.190] Generated private validator                  module=main keyFile=/cometbft/config/priv_validator_key.json stateFile=/cometbft/data/priv_validator_state.json
I[2024-01-26|13:37:32.190] Generated node key                           module=main path=/cometbft/config/node_key.json
I[2024-01-26|13:37:32.190] Generated genesis file                       module=main path=/cometbft/config/genesis.json
I[2024-01-26|13:37:32.213] Found private validator                      module=main keyFile=/cometbft/config/priv_validator_key.json stateFile=/cometbft/data/priv_validator_state.json
I[2024-01-26|13:37:32.213] Found node key                               module=main path=/cometbft/config/node_key.json
I[2024-01-26|13:37:32.213] Found genesis file                           module=main path=/cometbft/config/genesis.json
[cargo-make] INFO - Running Task: set-seeds
[cargo-make] INFO - Running Task: addr-book-enable
[cargo-make] INFO - Running Task: set-external-addr
[cargo-make] INFO - Running Task: duplicate-ip-enable
[cargo-make] INFO - Running Task: fendermint-deps
fendermint:latest
ghcr.io/consensus-shipyard/fendermint:latest
ghcr.io/consensus-shipyard/fendermint:<none>
fendermint image already exists
fendermint                              latest                6e2f0fa57445   33 minutes ago   248MB
ghcr.io/consensus-shipyard/fendermint   latest                44acf3f9daa7   20 hours ago     203MB
ghcr.io/consensus-shipyard/fendermint   <none>                94c788a2e80f   2 months ago     210MB
[cargo-make] INFO - Running Task: subnet-fetch-genesis
[cargo-make] INFO - Running Task: genesis-write
[cargo-make] INFO - Running Task: fendermint-new-network-key
[cargo-make] INFO - Running Task: subnet-convert-eth-key
[cargo-make] INFO - Running Task: testnode-export-keys
[cargo-make] INFO - Running Task: fendermint-start-validator
b25863d0d9a2ae96f406025c6fbec28b9e4a3c681bc136f830e5f982f1c6cd55
[cargo-make] INFO - Execute Command: "docker" "pull" "cometbft/cometbft:v0.37.x"
v0.37.x: Pulling from cometbft/cometbft
Digest: sha256:e6220583125171b617e79e112c8fbff5c9c56d569bf53c5faea3b124cf1b432a
Status: Image is up to date for cometbft/cometbft:v0.37.x
docker.io/cometbft/cometbft:v0.37.x
[cargo-make] INFO - Running Task: cometbft-start
74966a462a538c9a7843aa626ad10d377f531599bb425397eea4eacb78758ae8
[cargo-make] INFO - Running Task: cometbft-wait
[cargo-make] INFO - Running Task: ethapi-start
55e9f15003c0796694a2e96e3c265467851d00b3d552d2a2b11a789d827f5c7d
[cargo-make] INFO - Running Task: node-report
#################################
#                               #
# Subnet node ready! 🚀         #
#                               #
#################################

Subnet ID:
	/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a

Eth API:
	http://0.0.0.0:8545

Chain ID:
	489021674837045

Fendermint API:
	http://localhost:26658

CometBFT API:
	http://0.0.0.0:26657

CometBFT node ID:
	092a95385ccc6fcebe1fad0e77ee8105ef6bf965

CometBFT P2P:
	http://0.0.0.0:26656

IPLD Resolver Multiaddress:
	/ip4/0.0.0.0/tcp/26655/p2p/16Uiu2HAmGa3jAm2yPrCGbi3Y95B9b1Mv6KAx7f7VjXT6Srem2bjC
[cargo-make] INFO - Build Done in 32.76 seconds.
```

We'll need the _IPLD Resolver Multiaddress_ for the next nodes we'll start. Note that I replaced the `/ip4` part with `/dns`.

Let's start the second validator:

```shell
cargo make --makefile infra/fendermint/Makefile.toml \
    -e NODE_NAME=validator-2 \
    -e PRIVATE_KEY_PATH=/home/aakoshh/.ipc/validator_2.sk \
    -e SUBNET_ID=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a \
    -e CMT_P2P_HOST_PORT=26756 \
    -e CMT_RPC_HOST_PORT=26757 \
    -e ETHAPI_HOST_PORT=8645 \
    -e RESOLVER_HOST_PORT=26755 \
    -e BOOTSTRAPS=092a95385ccc6fcebe1fad0e77ee8105ef6bf965@validator-1-cometbft:26656 \
    -e RESOLVER_BOOTSTRAPS=/dns/validator-1-fendermint/tcp/26655/p2p/16Uiu2HAmGa3jAm2yPrCGbi3Y95B9b1Mv6KAx7f7VjXT6Srem2bjC \
    -e PARENT_REGISTRY=0xfb921983281AA25040f1f02e3aFd4A0e3e791e43 \
    -e PARENT_GATEWAY=0x7295c3A8d06e8d70e974165348559Cd2B36114e0 \
    -e FM_PULL_SKIP=1 \
    child-validator
```

and the third:

```shell
cargo make --makefile infra/fendermint/Makefile.toml \
    -e NODE_NAME=validator-3 \
    -e PRIVATE_KEY_PATH=/home/aakoshh/.ipc/validator_3.sk \
    -e SUBNET_ID=/r314159/t410fzi3d5onhzdpsmtcoimiauxr3z3t5txs2vquep7a \
    -e CMT_P2P_HOST_PORT=26856 \
    -e CMT_RPC_HOST_PORT=26857 \
    -e ETHAPI_HOST_PORT=8745 \
    -e RESOLVER_HOST_PORT=26855 \
    -e BOOTSTRAPS=092a95385ccc6fcebe1fad0e77ee8105ef6bf965@validator-1-cometbft:26656 \
    -e RESOLVER_BOOTSTRAPS=/dns/validator-1-fendermint/tcp/26655/p2p/16Uiu2HAmGa3jAm2yPrCGbi3Y95B9b1Mv6KAx7f7VjXT6Srem2bjC \
    -e PARENT_REGISTRY=0xfb921983281AA25040f1f02e3aFd4A0e3e791e43 \
    -e PARENT_GATEWAY=0x7295c3A8d06e8d70e974165348559Cd2B36114e0 \
    -e FM_PULL_SKIP=1 \
    child-validator
```
