import { useState } from "react";
import { Button, Form, Input, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './App.css';

function App() {
  const [result, setResult] = useState();
  const [prjName, setPrjName] = useState('');
  const [prjDesc, setPrjDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  async function onSubmit() {
    try {
      const formData = new FormData();
      formData.append('prjName', prjName);
      formData.append('prjDesc', prjDesc);
      formData.append('file', selectedFile);
      const response = await fetch("http://localhost:3001/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const onFinish = (values) => {
    console.log(values)
    onSubmit()
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const uploadProps = {
    name: 'file',
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
      setSelectedFile(e.dataTransfer.files[0]);
    },
  };

  return (
    <div>
      <main>
        <h2 style={{ textAlign: 'center', marginTop: 40, marginBottom: 40 }}>测试用例文档生成</h2>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="项目名"
            name="prjName"
            rules={[{ required: true, message: '请输入项目名' }]}
          >
            <Input onChange={(e) => setPrjName(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="prjDesc"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <Input.TextArea rows={4} onChange={(e) => setPrjDesc(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="proto 文件"
            name="file"
            rules={[{ required: true, message: '请上传文件' }]}
          >
            <input type="file" id="file" name="file" value={selectedFile} onChange={(e) => {
              setSelectedFile(e.target.files[0])
            }} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" block htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <div>{result}</div>
      </main>
    </div>
  );
}

export default App;
