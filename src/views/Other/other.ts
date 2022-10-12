import { LogSendData } from "@/utils/types";
import {XMLBuilder} from 'fast-xml-parser'

// export const genRecipeScriptData = (log: LogSendData)=>{
//     let result = '';
//     const s7f26Data = log.reply?.data;
//     if(!s7f26Data)return;

//     console.log(s7f26Data);
//     const ppid = s7f26Data.value[0].value + `-${new Date().getMonth() + 1}${new Date().getDate()}`
//     const mdln = s7f26Data.value[1].value
//     const softVer = s7f26Data.value[2].value
//     const recipeList = s7f26Data.value[3].value
    
//     result += `<Item ItemName="PPID" ItemType="A" Length="${ppid.length}" Fixed="False">${ppid}</Item>\r\n`
//     result += `\t<Item ItemName="MDLN" ItemType="A" Length="${mdln.length}" Fixed="False">${mdln}</Item>\r\n`
//     result += `<Item ItemName="SOFTREV" ItemType="A" Length="${softVer.length}" Fixed="False">${softVer}</Item>\r\n`

//     result += `<Item ItemName="c" ItemType="L" Length="${recipeList.length}" Fixed="False">\r\n`
//     for(let recipe of recipeList){
//         result += `<Item ItemName="" ItemType="L" Length="2" Fixed="True">\r\n`
//         const ccode = recipe.value[0]
//         const recipeContent = recipe.value[1].value

//         result += `<Item ItemName="CCODE" ItemType="${ccode.type}" Length="${ccode.value.length}" Fixed="False">${ccode.value}</Item>\r\n`

//         const scriptRecipeContent = recipeContent.map((e: {
//             type: string,
//             value: string,
//         })=>{
//             return `<Item ItemName="PPARM" ItemType="${e.type}" Length="${e.value?.length ?? 0}" Fixed="False">${e.value || ''}</Item>`
//         })
//         result += `<Item ItemName="p" ItemType="L" Length="${scriptRecipeContent.length}" Fixed="False">
//         ${scriptRecipeContent.join('\r\n')}
//       </Item>\r\n`

//         console.log(recipeContent, scriptRecipeContent)
//         result += `</Item>\r\n`
//     }
//     result += `</Item>\r\n`;

//     result = `<Group>
//     <GroupName>S7F23_Formatted Process Program Send</GroupName>
//     <Description>
//     </Description>
//     <WhenConnected>False</WhenConnected>
//     <SendInterval>0</SendInterval>
//     <Messages>
//     <Message>
//         <Header>
//         <MessageName>Formatted Process Program Send</MessageName>
//         <Description>
//         </Description>
//         <Stream>7</Stream>
//         <Function>23</Function>
//         <Direction>H-&gt;E</Direction>
//         <Wait>True</Wait>
//         <AutoReply>False</AutoReply>
//         </Header>
//         <DataItems>
//         <Item ItemName="" ItemType="L" Length="4" Fixed="True">
//             ${result}
//         </Item>
//         </DataItems>
//     </Message>
//     <Message>
//         <Header>
//         <MessageName>Formatted Process Program Acknowledge</MessageName>
//         <Description>
//         </Description>
//         <Stream>7</Stream>
//         <Function>24</Function>
//         <Direction>H&lt;-E</Direction>
//         <Wait>False</Wait>
//         <AutoReply>True</AutoReply>
//         </Header>
//         <DataItems>
//         <Item ItemName="ACKC7" ItemType="BIN" Length="1" Fixed="True">0</Item>
//         </DataItems>
//     </Message>
//     </Messages>
//     <ActionMessages />
//     </Group>`
//     return result
// }
export const genRecipeScriptDataV2 = (log: LogSendData): string=>{
    const input = {
        GROUP: {
            GroupName: "S7F23_Formatted Process Program Send",
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
                                Item: [] as any[]
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
    const s7f26Data = log.reply?.data;
    if(!s7f26Data)return '';

    console.log('s7f26Data:', s7f26Data);
    const ppid = s7f26Data.value[0].value + `-${new Date().getMonth() + 1}${new Date().getDate()}`
    const mdln = s7f26Data.value[1].value
    const softVer = s7f26Data.value[2].value
    const recipeList = s7f26Data.value[3].value
    const DataItems = input.GROUP.Messages.Message[0].DataItems
    const recipeList2: any[] = []
    console.log('ppid:', ppid)

    // PPID
    DataItems.Item?.Item?.push({
        "@_ItemName": 'PPID',
        "@_ItemType": 'A',
        "@_Length": ppid.length,
        "@_Fixed": 'False',
        "#text": ppid
    })
    // MDLN
    DataItems.Item?.Item?.push({
        "@_ItemName": 'MDLN',
        "@_ItemType": 'A',
        "@_Length": mdln.length,
        "@_Fixed": 'False',
        "#text": mdln
    })
    // SOFTREV
    DataItems.Item?.Item?.push({
        "@_ItemName": 'SOFTREV',
        "@_ItemType": 'A',
        "@_Length": softVer.length,
        "@_Fixed": 'False',
        "#text": softVer
    })
    // 配方生成

    // RECIPE
    DataItems.Item?.Item?.push({
        "@_ItemName": 'c',
        "@_ItemType": 'L',
        "@_Length": recipeList.length,
        "@_Fixed": 'False',
        Item: recipeList2
    })

    for(let recipe of recipeList){
        const ccode = recipe.value[0]
        const recipeContent = recipe.value[1].value
        const recipe1 = {
            "@_ItemName": '',
            "@_ItemType": 'L',
            "@_Length": 2,
            "@_Fixed": 'False',
            Item: [
                {
                    "@_ItemName": 'CCODE',
                    "@_ItemType": ccode.type,
                    "@_Length": ccode.value.length,
                    "@_Fixed": 'False',
                    "#text": ccode.value
                }
            ] as any[]
        }
        recipeList2.push(recipe1)

        const scriptRecipeContent = recipeContent.map((e: {
            type: string,
            value: any,
        })=>{
            return {
                "@_ItemName": 'PPARM',
                "@_ItemType": e.type,
                "@_Length": e.value?.length ?? 0,
                "@_Fixed": 'False',
                "#text": `${e.value || ''}`
            }
        })
        recipe1.Item.push({
            "@_ItemName": 'p',
            "@_ItemType": 'L',
            "@_Length": scriptRecipeContent.length,
            "@_Fixed": 'False',
            Item: scriptRecipeContent
        })
    }
    

    const options = {
        processEntities:true,
        format: true,
        ignoreAttributes: false,
        suppressEmptyNode: true,
    };
    
    const builder = new XMLBuilder(options);
    const xmlOutput = builder.build(input);
    return xmlOutput
}