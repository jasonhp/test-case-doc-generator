module.exports = (protoFileContent) => {
  // 定义用于解析proto文件的正则表达式
  const serviceRegex = /service\s+(\w+)\s*{([^}]*rpc\s+\w+\s*\([^}]*\)[^}]*})/g;
  const rpcRegex = /rpc\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*returns\s*\(\s*([^)]*)\s*\)/g;
  const messageRegex = /message\s+(\w+)\s*{([^}]*)}/g;

  // 定义每个分片最大的token数量
  const MAX_TOKENS_PER_SEGMENT = 4000;

  // 存储分片的数组
  const segments = [];

  // 定义当前分片中的token数量和内容
  let currentSegmentTokens = 0;
  let currentSegmentContent = '';

  // 定义一个函数，用于将message加入分片
  function addMessageToSegment(messageName) {
    protoFileContent.replace(messageRegex, (match, currentMessageName, currentMessageBody) => {
      if (currentMessageName === messageName) {
        // 如果找到了message，将其添加到当前分片
        currentSegmentContent += match.trim() + '\n';
        currentSegmentTokens += match.split(/\s+/).length;
        currentMessageBody.split(';').forEach((line) => {
          if (line.includes('.')) {
            // 如果该行中包含"."，说明其引用了其他message，需要递归地添加
            const referencedMessageName = line.trim().split('.').pop();
            addMessageToSegment(referencedMessageName);
          }
        });
      }
    });
  }

  // 使用正则表达式查找service和rpc定义
  protoFileContent.replace(serviceRegex, (match, serviceName, rpcDefinitions) => {
    // 将所有rpc定义拼接到一起，以便稍后处理
    let rpcDefinitionString = '';
    rpcDefinitions.replace(rpcRegex, (match, rpcName, requestType, responseType) => {
      rpcDefinitionString += match.trim() + '\n';
    });

    // 将每个rpc定义和相关的message添加到当前分片
    rpcDefinitionString.replace(rpcRegex, (match, rpcName, requestType, responseType) => {
      currentSegmentContent += match.trim() + '\n';
      currentSegmentTokens += match.split(/\s+/).length;

      addMessageToSegment(requestType.trim());
      addMessageToSegment(responseType.trim());

      // 如果当前分片中的token数量超过了最大限制，将其添加到分片数组中并开始一个新的分片
      if (currentSegmentTokens > MAX_TOKENS_PER_SEGMENT) {
        segments.push(currentSegmentContent.trim());
        currentSegmentContent = '';
        currentSegmentTokens = 0;
      }
    });
  });

  // 如果当前分片中有内容，将其添加到分片数组中
  if (currentSegmentContent.length > 0) {
    segments.push(currentSegmentContent.trim());
  }

  // 输出分片数组
  console.log(segments);
}