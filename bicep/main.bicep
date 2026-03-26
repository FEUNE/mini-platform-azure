@description('Environnement du déploiement')
param env string = 'dev'

@description('Région Azure')
param location string = 'swedencentral'

@description('Nom du projet')
param projectName string = 'miniplatform'

// Naming conventions
var vnetName = '${projectName}-${env}-vnet'
var subnetName = '${projectName}-${env}-subnet'

// VNet
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: subnetName
        properties: {
          addressPrefix: '10.0.1.0/24'
        }
      }
    ]
  }
}

output vnetId string = vnet.id
output vnetName string = vnet.name
