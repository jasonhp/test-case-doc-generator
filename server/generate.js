const { Configuration, OpenAIApi } = require("openai");

module.exports.generator = async function (req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  // Check if a file was uploaded
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }


  const prjName = req.body.prjName || '';
  if (prjName.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter project name",
      }
    });
    return;
  }
  const prjDesc = req.body.prjDesc || '';
  if (prjDesc.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter project description",
      }
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: 'user',
        content: generatePrompt1(prjName, prjDesc, req.file),
      }],
      temperature: 0.9,
    });
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}


function generatePrompt1(prjName, prjDesc, file) {
  return `
  帮我写一份测试用例文档。该文档所属项目是一个 ${prjName}，${prjDesc}。该文档用于提供给测试人员进行 API 接口测试，注意该文档不是测试报告，是测试用例文档，文档中需包含每个接口的描述以及测试用例列表，以 Markdown 形式输出。该项目 API 接口的 .proto 文件内容如下：

  ${file.buffer.toString('utf8')}
  
  `
}

// openstack 云主机管理平台
// 该项目基于 gopher-cloud 库实现，提供一套 API 接口，实现对 openstack 云主机的管理。