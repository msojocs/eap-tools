const {XMLBuilder, XMLParser} = require('fast-xml-parser')
const XMLdata = `
<car>
    <color alpha="7">
        <a>123</a>
    </color>
    <type>minivan</type>
    <registration>2020-02-03</registration>
    <capacity>7</capacity>
</car>`;

const options1 = {
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true
};
const parser = new XMLParser(options1);
let result = parser.parse(XMLdata);
console.log(JSON.stringify(result, null,4));
const input = {
    GROUP: {
        GroupName: "",
        Description: "",
        WhenConnected: 'False',
        SendInterval: 0,
        Messages: {
            Message: [
                {
                    Header: {
                        MessageName: "Formatted Process Program Send",
                        Description: "",
                        Stream: 7,
                        Function: 23,
                        Direction: "H->E",
                        Wait: 'True',
                        AutoReply: 'False',
                    },
                    DataItems: {
                        Item: {
                            "@_ItemName": '',
                            "@_ItemType": 'L',
                            "@_Length": 4,
                            "@_Fixed": 'True',
                            Item: [
                                {
                                    "@_ItemName": 'PPID',
                                    "@_ItemType": 'A',
                                    "@_Length": 4,
                                    "@_Fixed": 'False',
                                    "#text": 'test1012'
                                },
                                {
                                    "@_ItemName": 'MDLN',
                                    "@_ItemType": 'A',
                                    "@_Length": 4,
                                    "@_Fixed": 'False',
                                    "#text": 'test1012'
                                },
                                {
                                    "@_ItemName": 'SOFTREV',
                                    "@_ItemType": 'A',
                                    "@_Length": 4,
                                    "@_Fixed": 'False',
                                    "#text": 'test1012'
                                },
                                {
                                    "@_ItemName": 'c',
                                    "@_ItemType": 'L',
                                    "@_Length": 4,
                                    "@_Fixed": 'False',
                                    Item: [
                                        {}
                                    ]
                                },
                            ]
                        }
                    },
                },
                {
                    Header: {
                        MessageName: "Formatted Process Program Acknowledge",
                        Description: "",
                        Stream: 7,
                        Function: 24,
                        Direction: "H<-E",
                        Wait: 'False',
                        AutoReply: 'True',
                    },
                    DataItems: {
                        Item: {
                            "@_ItemName": 'ACKC7',
                            "@_ItemType": 'BIN',
                            "@_Length": 1,
                            "@_Fixed": 'True',
                            '#text': 0
                        }
                    },
                }
            ]
        },
        ActionMessages: ''
    }
};

const options = {
    processEntities:true,
    format: true,
    ignoreAttributes: false,
    commentPropName: "phone",
    suppressEmptyNode: true,
};

const builder = new XMLBuilder(options);
const xmlOutput = builder.build(input);
console.log(xmlOutput)