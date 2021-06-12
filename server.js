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
const applicationUri = "urn:AndreasHeineOpcUaServer";
const PKIFolder = "pki";
const serverCertificate = "server_certificate.pem";
const privateKey = "private_key.pem";
const port = 4840;
const ip = "127.0.0.1";
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
function create_addressSpace() {
    const addressSpace = server.engine.addressSpace;
    if (addressSpace === null)
        return;
    const namespace = addressSpace.registerNamespace("http://andreas-heine.net/ua/");
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
                description: "setpoint for pretreatment",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint2",
                description: "setpoint for pretreatment",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint3",
                description: "setpoint for pretreatment",
                dataType: node_opcua_1.DataType.UInt32,
                arrayDimensions: [node_opcua_1.VariantArrayType.Scalar],
            },
        ]
    });
    if (GetCarrierDataMethod.outputArguments != undefined) {
        GetCarrierDataMethod.outputArguments.userAccessLevel = node_opcua_1.makeAccessLevelFlag("CurrentRead");
    }
    if (GetCarrierDataMethod.inputArguments != undefined) {
        GetCarrierDataMethod.inputArguments.userAccessLevel = node_opcua_1.makeAccessLevelFlag("CurrentRead");
    }
    GetCarrierDataMethod.bindMethod((inputArguments, context, callback) => {
        const carrier = inputArguments[0].value;
        const machine = inputArguments[1].value;
        let ProzessSetpoint1;
        let ProzessSetpoint2;
        let ProzessSetpoint3;
        /*
        SQL-Querry
        */
        console.log("SQL-Query");
        console.log(`Request for carrier: ${carrier} and machine: ${machine}`);
        if (carrier === 0 || machine === 0) {
            ProzessSetpoint1 = 0;
            ProzessSetpoint2 = 0;
            ProzessSetpoint3 = 0;
        }
        else {
            ProzessSetpoint1 = 100;
            ProzessSetpoint2 = 200;
            ProzessSetpoint3 = 300;
        }
        ;
        const callMethodResult = {
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
        };
        callback(null, callMethodResult);
    });
    // const SetCarrierDataMethod = namespace.addMethod(methodfolder, {
    //     browseName: "SetCarrierData",
    //     displayName: "SetCarrierData",
    //     inputArguments: [],
    //     outputArguments: [],
    // })
}
;
const init = () => {
    create_addressSpace();
    server.start();
    const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
    process.on("SIGINT", () => {
        process.exit(0);
    });
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        server.initialize(init);
    }
    catch (error) {
        console.log("error", error);
        process.exit(-1);
    }
}))();
