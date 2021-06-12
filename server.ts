import { 
    OPCUACertificateManager,
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy,
    DataType,
    VariantArrayType,
    makeAccessLevelFlag,
    StatusCodes,
    resolveNodeId,
    ModellingRuleType,
    AddressSpace,
    ServerCapabilities,
    OperationLimits,
} from "node-opcua";
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as child_process from "child_process";
import { fileURLToPath } from 'url';

const applicationUri = "urn:AndreasHeineOpcUaServer";
const PKIFolder = "pki";
const serverCertificate = "server_certificate.pem";
const privateKey = "private_key.pem";
const port = 4840;
const ip = "127.0.0.1";

const userManager = {
    isValidUser: (userName: string, password: string) => {
        if (userName === "user" && password === "pw") {
            return true;
        }
        return false;
    }
};

const serverCertificateManager = new OPCUACertificateManager({
    automaticallyAcceptUnknownCertificate: false,
    name: "pki",
    rootFolder: PKIFolder
});

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
});

function create_addressSpace() {

    const addressSpace = server.engine.addressSpace;
    if (addressSpace === null) return

    const namespace = addressSpace.registerNamespace("http://andreas-heine.net/ua/");

    const mesNode = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MES"
    });

    const methodfolder = namespace.addObject(
        {
            browseName: "Methods",
            componentOf: mesNode,
            typeDefinition: "FolderType",
        }
    );
    
    const GetCarrierDataMethod = namespace.addMethod(methodfolder, {
        browseName: "GetCarrierData",
        displayName: "GetCarrierData",
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
                description: "setpoint for pretreatment",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint2",
                description: "setpoint for pretreatment",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
            {
                name: "ProzessSetpoint3",
                description: "setpoint for pretreatment",
                dataType: DataType.UInt32,
                arrayDimensions: [VariantArrayType.Scalar],
            },
        ]
    });

    if (GetCarrierDataMethod.outputArguments != undefined) {
        GetCarrierDataMethod.outputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead");
    }

    if (GetCarrierDataMethod.inputArguments != undefined) {
        GetCarrierDataMethod.inputArguments.userAccessLevel = makeAccessLevelFlag("CurrentRead");
    }

    GetCarrierDataMethod.bindMethod((inputArguments,context,callback) => {
        
        const carrier = inputArguments[0].value;
        const machine =  inputArguments[1].value;

        let ProzessSetpoint1: number;
        let ProzessSetpoint2: number;
        let ProzessSetpoint3: number;

        /* 
        SQL-Querry
        */
        console.log("SQL-Query");
        console.log(`Request for carrier: ${carrier} and machine: ${machine}`);
        

        if (carrier === 0 || machine === 0) {
            ProzessSetpoint1 = 0;
            ProzessSetpoint2 = 0;
            ProzessSetpoint3 = 0;
        } else {
            ProzessSetpoint1 = 100;
            ProzessSetpoint2 = 200;
            ProzessSetpoint3 = 300;
        };

        const callMethodResult = {
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
        };
        callback(null,callMethodResult);
    })

    // const SetCarrierDataMethod = namespace.addMethod(methodfolder, {
    //     browseName: "SetCarrierData",
    //     displayName: "SetCarrierData",
    //     inputArguments: [],
    //     outputArguments: [],
    // })

};

const init = () => {
    create_addressSpace();

    server.start();
    
    const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;

    process.on("SIGINT", () => {
        process.exit(0);
    });
}

(async () => {

    try {
        server.initialize(init);
    } catch (error) {
        console.log("error", error);
        process.exit(-1);
    }

})();


