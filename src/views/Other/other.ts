import { LogSendData } from "@/utils/types";

export const genRecipeScriptData = (log: LogSendData)=>{
    let result = '';
    const s7f26Data = log.reply?.data;
    if(!s7f26Data)return;

    console.log(s7f26Data);
    const ppid = s7f26Data.value[0].value + `-${new Date().getMonth() + 1}${new Date().getDate()}`
    const mdln = s7f26Data.value[1].value
    const softVer = s7f26Data.value[2].value
    const recipeList = s7f26Data.value[3].value
    
    result += `<Item ItemName="PPID" ItemType="A" Length="${ppid.length}" Fixed="False">${ppid}</Item>\r\n`
    result += `\t<Item ItemName="MDLN" ItemType="A" Length="${mdln.length}" Fixed="False">${mdln}</Item>\r\n`
    result += `<Item ItemName="SOFTREV" ItemType="A" Length="${softVer.length}" Fixed="False">${softVer}</Item>\r\n`

    result += `<Item ItemName="c" ItemType="L" Length="${recipeList.length}" Fixed="False">\r\n`
    for(let recipe of recipeList){
        result += `<Item ItemName="" ItemType="L" Length="2" Fixed="True">\r\n`
        const ccode = recipe.value[0].value
        const recipeContent = recipe.value[1].value

        result += `<Item ItemName="CCODE" ItemType="A" Length="${ccode.length}" Fixed="False">${ccode}</Item>\r\n`

        const scriptRecipeContent = recipeContent.map((e: {
            type: string,
            value: string,
        })=>{
            return `<Item ItemName="PPARM" ItemType="${e.type}" Length="${e.value?.length ?? 0}" Fixed="False">${e.value || ''}</Item>`
        })
        result += `<Item ItemName="p" ItemType="L" Length="${scriptRecipeContent.length}" Fixed="False">
        ${scriptRecipeContent.join('\r\n')}
      </Item>\r\n`

        console.log(recipeContent, scriptRecipeContent)
        result += `</Item>\r\n`
    }
    result += `</Item>\r\n`;

    result = `<Group>
    <GroupName>S7F23_Formatted Process Program Send</GroupName>
    <Description>
    </Description>
    <WhenConnected>False</WhenConnected>
    <SendInterval>0</SendInterval>
    <Messages>
    <Message>
        <Header>
        <MessageName>Formatted Process Program Send</MessageName>
        <Description>
        </Description>
        <Stream>7</Stream>
        <Function>23</Function>
        <Direction>H-&gt;E</Direction>
        <Wait>True</Wait>
        <AutoReply>False</AutoReply>
        </Header>
        <DataItems>
        <Item ItemName="" ItemType="L" Length="4" Fixed="True">
            ${result}
        </Item>
        </DataItems>
    </Message>
    <Message>
        <Header>
        <MessageName>Formatted Process Program Acknowledge</MessageName>
        <Description>
        </Description>
        <Stream>7</Stream>
        <Function>24</Function>
        <Direction>H&lt;-E</Direction>
        <Wait>False</Wait>
        <AutoReply>True</AutoReply>
        </Header>
        <DataItems>
        <Item ItemName="ACKC7" ItemType="BIN" Length="1" Fixed="True">0</Item>
        </DataItems>
    </Message>
    </Messages>
    <ActionMessages />
    </Group>`
    return result
}