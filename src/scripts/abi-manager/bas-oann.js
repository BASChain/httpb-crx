const Addresses = {
 1:'0x6a76585B037988281Aa2c80E6E42d689bA940Cef',
  3:'0x5e6B639843da8A9883aF8055C71D21d7dd4c30C3'
}

const ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "name",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "option",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "receipt",
        "type": "bytes32"
      }
    ],
    "name": "Paid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "SettingChanged",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "_a_changeAdmin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "conAddr",
        "type": "address"
      }
    ],
    "name": "_a_changeContract",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      }
    ],
    "name": "closeCustomedPrice",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      }
    ],
    "name": "closeToPublic",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "openCustomedPrice",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      }
    ],
    "name": "openToPublic",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes",
        "name": "name",
        "type": "bytes"
      },
      {
        "internalType": "uint8",
        "name": "durationInYear",
        "type": "uint8"
      }
    ],
    "name": "recharge",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes",
        "name": "name",
        "type": "bytes"
      },
      {
        "internalType": "bool",
        "name": "isOpen",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCustomed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "cusPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "durationInYear",
        "type": "uint8"
      }
    ],
    "name": "registerRoot",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes",
        "name": "rName",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "sName",
        "type": "bytes"
      },
      {
        "internalType": "uint8",
        "name": "durationInYear",
        "type": "uint8"
      }
    ],
    "name": "registerSub",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newGas",
        "type": "uint256"
      }
    ],
    "name": "setARootGas",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newGas",
        "type": "uint256"
      }
    ],
    "name": "setBRootGas",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newGas",
        "type": "uint256"
      }
    ],
    "name": "setCustomedPriceGas",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "year",
        "type": "uint256"
      }
    ],
    "name": "setMaxYear",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint8",
        "name": "len",
        "type": "uint8"
      }
    ],
    "name": "setRareTypeLength",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes4",
        "name": "ipv4",
        "type": "bytes4"
      },
      {
        "internalType": "bytes16",
        "name": "ipv6",
        "type": "bytes16"
      },
      {
        "internalType": "bytes",
        "name": "bca",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "opData",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "aliasName",
        "type": "string"
      }
    ],
    "name": "setRecord",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newGas",
        "type": "uint256"
      }
    ],
    "name": "setSubGas",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_t",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_o",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_a",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_d",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_m",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_r",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AROOT_GAS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "BROOT_GAS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "checkAssociatedContractAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "BasToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "BasOwnership",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "BasAsset",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "BasDNS",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "BasMiner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "BasRule",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "contractCaller",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "CUSTOMED_PRICE_GAS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "bytes",
        "name": "name",
        "type": "bytes"
      },
      {
        "internalType": "bool",
        "name": "isCustomed",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "durationInYear",
        "type": "uint8"
      }
    ],
    "name": "evalueRootPrice",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exist",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "bytes",
        "name": "rName",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "sName",
        "type": "bytes"
      },
      {
        "internalType": "uint8",
        "name": "durationInYear",
        "type": "uint8"
      }
    ],
    "name": "evalueSubPrice",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "nameHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "totalName",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "rootHash",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "rootOwner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isCustomed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exist",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "MAX_YEAR",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "RARE_TYPE_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "SUB_GAS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint8",
        "name": "y",
        "type": "uint8"
      }
    ],
    "name": "validDuration",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]

module.exports.BasOann = function(chainId){
  let id = parseInt(chainId)
  return {
    address: Addresses[id]||Addresses[3],
    abi:ABI
  }
}