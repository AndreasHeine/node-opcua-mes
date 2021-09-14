import { 
    OPCUACertificateManager,
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy,
    DataType,
    VariantArrayType,
    makeAccessLevelFlag,
    StatusCodes,
    ServerCapabilities,
    OperationLimits,
    ServerState,
    coerceLocalizedText,
} from "node-opcua"

const port = Number(process.env.PORT) || 4840
const ip = process.env.IP || "0.0.0.0"

const applicationUri = "urn:AndreasHeineOpcUaServer"
const PKIFolder = "pki"
const serverCertificate = "server_certificate.pem"
const privateKey = "private_key.pem"

const userManager = {
    isValidUser: (userName: string, password: string) => {
        if (userName === "user" && password === "pw") {
            return true
        }
        return false
    }
}

const serverCertificateManager = new OPCUACertificateManager({
    automaticallyAcceptUnknownCertificate: false,
    name: "pki",
    rootFolder: PKIFolder
})

const server = new OPCUAServer({
    port: port,
    hostname: ip,
    resourcePath: "/UA",
    buildInfo : {
        productUri: "MES 1",
        productName: "MES",
        manufacturerName: "Andreas Heine",
        buildNumber: "v1.0.0",
        buildDate: new Date(2020,10,26)
    },
    serverInfo: {
        applicationName: { 
            text: "NodeOPCUA Server", 
            locale: "en" 
        },
        applicationUri,
        productUri: "NodeOPCUA-Server"
      },
    serverCapabilities: new ServerCapabilities({
        maxBrowseContinuationPoints: 10,
        maxArrayLength: 1000,
        operationLimits: new OperationLimits({
            maxMonitoredItemsPerCall: 1000,
            maxNodesPerBrowse: 1000,
            maxNodesPerRead: 1000,
            maxNodesPerRegisterNodes: 1000,
            maxNodesPerTranslateBrowsePathsToNodeIds: 1000,
            maxNodesPerWrite: 1000,
        })
    }),
    userManager: userManager,
    allowAnonymous: false,
    securityModes: [
        MessageSecurityMode.None, 
        MessageSecurityMode.SignAndEncrypt,
    ],
    securityPolicies: [
        SecurityPolicy.None, 
        SecurityPolicy.Basic256Sha256,
    ],
    disableDiscovery: false,
    serverCertificateManager: serverCertificateManager,
    certificateFile: serverCertificate,
    privateKeyFile: privateKey,
    nodeset_filename: [
        "./nodesets/Opc.Ua.NodeSet2.xml", 
        "./nodesets/Opc.Ua.Di.NodeSet2.xml", 
        "./nodesets/Opc.Ua.Machinery.NodeSet2.xml",
    ],
})

/*
mockdata
*/
let dbSetpoint1 = 100
let dbSetpoint2 = 200
let dbSetpoint3 = 300

const create_addressSpace = async () => {
    const addressSpace = server.engine.addressSpace
    if (addressSpace === null) return

    const namespace = addressSpace.registerNamespace("http://andreas-heine.net/UA/MES/")

    const mesNode = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MES"
    })

    const methodfolder = namespace.addObject(
        {
            browseName: "Methods",
            componentOf: mesNode,
            typeDefinition: "FolderType",
        }
    )
    
    const getCarrierDataMethod = namespace.addMethod(methodfolder, {
        browseName: "GetCarrierData",
        displayName: "GetCarrierData",
        executable: true,
        userExecutable: true,
        inputArguments: [
            {
                name: "CarrierId",
                description: "tray or carrier id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },                
            {
                name: "MachineId",
                description: "unique machine id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
        ],
        outputArguments: [
            {
                name: "CarrierId",
                description: "tray or carrier id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "MachineId",
                description: "unique machine id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint1",
                description: "setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint2",
                description: "setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint3",
                description: "setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
        ]
    })

    if (getCarrierDataMethod.outputArguments) {
        getCarrierDataMethod.outputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead")
    }

    if (getCarrierDataMethod.inputArguments) {
        getCarrierDataMethod.inputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead")
    }

    getCarrierDataMethod.bindMethod((inputArguments, context, callback) => {
        
        const carrier = inputArguments[0].value
        const machine =  inputArguments[1].value

        // validate inputs!
        if (carrier === 0 || machine === 0) {
            // inputs invalid
            // TODO! maybe refactor to factoryfunction returning the resultobject
            callback(null, {
                statusCode: StatusCodes.BadNothingToDo, // invalid inputs will be ignored
                outputArguments: [
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: carrier
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: machine
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: 0
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: 0
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: 0
                    }
                ]
            })
        } else {
            // inputs valid

            /* 
            sql-querry
            */
            console.log("sql-query")
            console.log(`request for getCarrierData -> carrier: ${carrier} and machine: ${machine}`)

            // get mockdata
            let ProzessSetpoint1 = dbSetpoint1
            let ProzessSetpoint2 = dbSetpoint2
            let ProzessSetpoint3 = dbSetpoint3

            callback(null, {
                statusCode: StatusCodes.Good,
                outputArguments: [
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: carrier
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: machine
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: ProzessSetpoint1
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: ProzessSetpoint2
                    },
                    {
                        dataType: DataType.UInt32,
                        arrayType: VariantArrayType.Scalar,
                        value: ProzessSetpoint3
                    }
                ]
            })
        }
    })

    const setCarrierDataMethod = namespace.addMethod(methodfolder, {
        browseName: "SetCarrierData",
        displayName: "SetCarrierData",
        inputArguments: [                    
            {
                name: "CarrierId",
                description: "tray or carrier id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },                
            {
                name: "MachineId",
                description: "unique machine id",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint1",
                description: "new setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },                
            {
                name: "ProzessSetpoint2",
                description: "new setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint3",
                description: "new setpoint",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
    ],
        outputArguments: [],
    })

    if (setCarrierDataMethod.outputArguments) {
        setCarrierDataMethod.outputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead")
    }

    if (setCarrierDataMethod.inputArguments) {
        setCarrierDataMethod.inputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead")
    }

    setCarrierDataMethod.bindMethod((inputArguments, context, callback) => {
        const carrier = inputArguments[0].value
        const machine =  inputArguments[1].value
        const setpoint1 =  inputArguments[2].value
        const setpoint2 =  inputArguments[3].value
        const setpoint3 =  inputArguments[4].value

        // validate inputs!
        if (carrier === 0 || machine === 0 && setpoint1 != 0 && setpoint2 != 0 && setpoint3 != 0) {
            // inputs invalid
            // TODO! maybe refactor to factoryfunction returning the resultobject
            callback(null, {
                statusCode: StatusCodes.BadNothingToDo, // invalid inputs will be ignored
                outputArguments: []
            })
        } else {
            // inputs valid

            /* 
            sql-querry
            */
            console.log("sql-query")
            console.log(`request for setCarrierData -> carrier: ${carrier} and machine: ${machine}`)

            //write mockdata
            dbSetpoint1 = setpoint1
            dbSetpoint2 = setpoint2
            dbSetpoint3 = setpoint3

            callback(null, {
                statusCode: StatusCodes.Good,
                outputArguments: []
            })
        }
    })
}

const startup = async () => {
    console.log(" starting server... ")
    await server.start()
    console.log(" server is ready on: ")
    server.endpoints.forEach(endpoint => console.log(" |--> ",endpoint.endpointDescriptions()[0].endpointUrl))
    console.log(" CTRL+C to stop ")
    process.on("SIGINT", () => {
        if (server.engine.serverStatus.state === ServerState.Shutdown) {
            console.log(" Server shutdown already requested... shutdown will happen in ", server.engine.serverStatus.secondsTillShutdown, "second")
            return
        }
        console.log(" Received server interruption from user ")
        console.log(" shutting down ...")
        const reason = coerceLocalizedText("Shutdown by administrator")
        if (reason) {
            server.engine.serverStatus.shutdownReason = reason
        }
        server.shutdown(10000, () => {
        console.log(" shutting down completed ")
        console.log(" done ")
        process.exit(0)
        })
    })
}

(async () => {
    try {
        await server.initialize()
        await create_addressSpace()
        await startup()
    } catch (error) {
        console.log(" error ", error)
        process.exit(-1)
    }
})()