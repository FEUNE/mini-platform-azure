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


// PostgreSQL Flexible Server
@description('Nom administrateur PostgreSQL')
param dbAdminUser string = 'discount'

@description('Mot de passe administrateur PostgreSQL - min 8 chars, majuscule, chiffre, spécial')
@secure()
@minLength(8)
param dbAdminPassword string

var dbServerName = '${projectName}-${env}-pg'
var dbName = '${projectName}db'

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {  name: dbServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Base de données
resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {  parent: postgresServer
  name: dbName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Règle firewall - bloquer tout accès public par défaut
resource firewallDenyAll 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {  parent: postgresServer
  name: 'DenyAllPublicAccess'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output dbServerName string = postgresServer.name
output dbFqdn string = postgresServer.properties.fullyQualifiedDomainName
output dbName string = postgresDb.name

// Azure Container Registry
var acrName = '${projectName}${env}acr'

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
