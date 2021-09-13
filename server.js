"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_opcua_1 = require("node-opcua");
const port = Number(process.env.PORT) || 4840;
const ip = process.env.IP || "0.0.0.0";
const applicationUri = "urn:AndreasHeineOpcUaServer";
const PKIFolder = "pki";
const serverCertificate = "server_certificate.pem";
const privateKey = "private_key.pem";
const userManager = {
    isValidUser: (userName, password) => {
        if (userName === "user" && password === "pw") {
            return true;
        }
        return false;
    }
};
const serverCertificateManager = new node_opcua_1.OPCUACertificateManager({
    automaticallyAcceptUnknownCertificate: false,
    name: "pki",
    rootFolder: PKIFolder
});
const server = new node_opcua_1.OPCUAServer({
    port: port,
    hostname: ip,
    resourcePath: "/UA",
    buildInfo: {
        productUri: "MES 1",
        productName: "MES",
        manufacturerName: "Andreas Heine",
        buildNumber: "v1.0.0",
        buildDate: new Date(2020, 10, 26)
    },
    serverInfo: {
        applicationName: {
            text: "NodeOPCUA Server",
            locale: "en"
        },
        applicationUri,
        productUri: "NodeOPCUA-Server"
    },
    serverCapabilities: new node_opcua_1.ServerCapabilities({
        maxBrowseContinuationPoints: 10,
        maxArrayLength: 1000,
        operationLimits: new node_opcua_1.OperationLimits({
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
        node_opcua_1.MessageSecurityMode.None,
        node_opcua_1.MessageSecurityMode.SignAndEncrypt,
    ],
    securityPolicies: [
        node_opcua_1.SecurityPolicy.None,
        node_opcua_1.SecurityPolicy.Basic256Sha256,
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
});
const create_addressSpace = () => __awaiter(void 0, void 0, void 0, function* () {
    const addressSpace = server.engine.addressSpace;
    if (addressSpace === null)
        return;
    const namespace = addressSpace.registerNamespace("http://andreas-heine.net/UA/MES/");
    const mesNode = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MES"
    });
    const methodfolder = namespace.addObject({
        browseName: "Methods",
        componentOf: mesNode,
        typeDefinition: "FolderType",
    });
    const GetCarrierDataMethod = namespace.addMethod(methodfolder, {
        browseName: "GetCarrierData",
        displayName: "GetCarrierData",
        executable: true,
        userExecutable: true,
        inputArguments: [
            {
                name: "CarrierId",
                description: "tray or carrier id",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "MachineId",
                description: "unique machine id",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
        ],
        outputArguments: [
            {
                name: "CarrierId",
                description: "tray or carrier id",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "MachineId",
                description: "unique machine id",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint1",
                description: "setpoint",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint2",
                description: "setpoint",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint3",
                description: "setpoint",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
        ]
    });
    if (GetCarrierDataMethod.outputArguments) {
        GetCarrierDataMethod.outputArguments.userAccessLevel = node_opcua_1.makeAccessLevelFlag("CurrentRead");
    }
    if (GetCarrierDataMethod.inputArguments) {
        GetCarrierDataMethod.inputArguments.userAccessLevel = node_opcua_1.makeAccessLevelFlag("CurrentRead");
    }
    GetCarrierDataMethod.bindMethod((inputArguments, context, callback) => {
        const carrier = inputArguments[0].value;
        const machine = inputArguments[1].value;
        // validate inputs!
        if (carrier === 0 || machine === 0) {
            // inputs invalid
            // TODO! maybe refactor to factoryfunction returning the resultobject
            callback(null, {
                statusCode: node_opcua_1.StatusCodes.BadNothingToDo,
                outputArguments: [
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: carrier
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: machine
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: 0
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: 0
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: 0
                    }
                ]
            });
        }
        else {
            // inputs valid
            /*
            SQL-Querry
            */
            console.log("SQL-Query");
            console.log(`Request for carrier: ${carrier} and machine: ${machine}`);
            let ProzessSetpoint1 = 100;
            let ProzessSetpoint2 = 200;
            let ProzessSetpoint3 = 300;
            callback(null, {
                statusCode: node_opcua_1.StatusCodes.Good,
                outputArguments: [
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: carrier
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: machine
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: ProzessSetpoint1
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: ProzessSetpoint2
                    },
                    {
                        dataType: node_opcua_1.DataType.UInt32,
                        arrayType: node_opcua_1.VariantArrayType.Scalar,
                        value: ProzessSetpoint3
                    }
                ]
            });
        }
        ;
    });
    // const SetCarrierDataMethod = namespace.addMethod(methodfolder, {
    //     browseName: "SetCarrierData",
    //     displayName: "SetCarrierData",
    //     inputArguments: [],
    //     outputArguments: [],
    // })
});
const startup = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(" starting server... ");
    yield server.start();
    console.log(" server is ready on: ");
    server.endpoints.forEach(endpoint => console.log(" |--> ", endpoint.endpointDescriptions()[0].endpointUrl));
    console.log(" CTRL+C to stop ");
    process.on("SIGINT", () => {
        if (server.engine.serverStatus.state === node_opcua_1.ServerState.Shutdown) {
            console.log(" Server shutdown already requested... shutdown will happen in ", server.engine.serverStatus.secondsTillShutdown, "second");
            return;
        }
        console.log(" Received server interruption from user ");
        console.log(" shutting down ...");
        const reason = node_opcua_1.coerceLocalizedText("Shutdown by administrator");
        if (reason) {
            server.engine.serverStatus.shutdownReason = reason;
        }
        server.shutdown(10000, () => {
            console.log(" shutting down completed ");
            console.log(" done ");
            process.exit(0);
        });
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.initialize();
        yield create_addressSpace();
        yield startup();
    }
    catch (error) {
        console.log(" error ", error);
        process.exit(-1);
    }
}))();
