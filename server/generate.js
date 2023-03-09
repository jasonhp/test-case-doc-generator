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
      temperature: 0.6,
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


function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.
Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}

function generatePrompt1(prjName, prjDesc, file) {
  return `Give me a test case document about a ${prjName} project. ${prjDesc} The protobuf file of its API is as follows:

  ${file.buffer.toString('utf8')}
`
}
