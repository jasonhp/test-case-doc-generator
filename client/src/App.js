import { useState } from "react";
import { marked } from 'marked'
import { saveAs } from 'file-saver';
import dompurify from 'dompurify'
import 'github-markdown-css/github-markdown-light.css'
import { Button, Form, Input, Skeleton } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './App.css';

function App() {
  const [result, setResult] = useState();
  const [prjName, setPrjName] = useState('');
  const [prjDesc, setPrjDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      setResult('')
      setLoading(true)
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
      console.log(data.result)
      setLoading(false)
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
      setLoading(false)
    }
  }

  const onFinish = (values) => {
    console.log(values)
    onSubmit()
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const download = () => {
    const blob = new Blob([result], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'test-case-doc.md')
  };

  return (
    <div>
      <main>
        <h2 style={{ textAlign: 'center', marginTop: 40, marginBottom: 40 }}>测试用例文档生成</h2>
        <Form
          name="basic"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="这是什么项目"
            name="prjName"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input placeholder="一句话描述" onChange={(e) => setPrjName(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="prjDesc"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <Input.TextArea placeholder="详细描述" maxLength={140} rows={4} onChange={(e) => setPrjDesc(e.target.value)} />
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

          <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
            <Button disabled={loading} type="primary" block htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <div style={{
          width: 1000,
          margin: '40px auto',
          padding: 24,
          border: '1px solid #ccc'
        }}>
          {
          loading ? 
          <>
            <p>所需时间较长，请耐心等待</p>
            <Skeleton active />
          </>
          :
          (result &&
            <>
              <div className="btns" style={{ marginBottom: 20 }}>
                <Button style={{ margin: '0 5px' }} type="primary" onClick={download}>下载 .md 文件</Button>
                <Button style={{ margin: '0 5px' }} onClick={onSubmit}>重新生成</Button>
                <Button style={{ margin: '0 5px' }} onClick={() => { setResult('') }}>清空</Button>
              </div>

              <div className="markdown-body" dangerouslySetInnerHTML={{__html: dompurify.sanitize(marked.parse(result))}}/> 
            </>
          )
          }
        </div>
      </main>
    </div>
  );
}

export default App;
