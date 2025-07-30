import React, { useState, useEffect,useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { initialzeSocket,receiveMessage,sendMessage } from '../config/socket';
import { useUser } from '../context/userContext'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer';


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state.project);
  const [users, setUsers] = useState([]);
  const [message,setMessage]=useState("")
  const {user}=useUser();
  const [ messages, setMessages ] = useState([])
  const [currentFile,setCurrentFile]=useState(null)
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer,setWebContainer]=useState(null)
  const [iframeUrl,setIframeUrl]=useState(null)
  const [runProcess,setRunProcess]=useState(null)
  const [webContainerReady, setWebContainerReady] = useState(false)
  // const [pendingFileTree, setPendingFileTree] = useState(null)
  const [fileTree,setFileTree]=useState({
    
  })
  const messageBox=React.createRef()
// adding collobarators while clicking 
  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const addCollaborators = () => {
    if (!project?._id) return;
    axios.put("/projects/add-user", {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(res => {
      setIsModalOpen(false);
      setProject(res.data.project);
    }).catch(console.error);
  };
  const send=()=>{
    console.log(user)
    sendMessage("project-message",{

      message,
      sender:user
    })
    setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ])
    setMessage("")
  }
  //  initialitization of web container
  useEffect(() => {
        const initWebContainer = async () => {
            try {
                console.log("Initializing WebContainer...");
                const container = await getWebContainer();
                setWebContainer(container);
                setWebContainerReady(true);
                console.log("WebContainer initialized successfully");
            } catch (error) {
                console.error("Failed to initialize WebContainer:", error);
                setWebContainerReady(false);
            }
        };

        if (!webContainer) {
            initWebContainer();
        }
    }, []);

    useEffect(() => {
        initialzeSocket(project._id)

        receiveMessage('project-message', async data => {
            console.log(data)

            if (data.sender._id == 'ai') {
                try {
                    const message = JSON.parse(data.message)
                    console.log(message)

                    // Only mount if webContainer is ready and we have fileTree
                    if (webContainer && webContainerReady && message.fileTree) {
                        try {
                            await webContainer.mount(message.fileTree);
                            console.log("FileTree mounted successfully from AI message");
                        } catch (mountError) {
                            console.error("Error mounting fileTree from AI:", mountError);
                        }
                    }

                    if (message.fileTree) {
                        setFileTree(message.fileTree || {})
                    }
                    setMessages(prevMessages => [...prevMessages, data])
                } catch (parseError) {
                    console.error("Error parsing AI message:", parseError);
                    setMessages(prevMessages => [...prevMessages, data])
                }
            } else {
                setMessages(prevMessages => [...prevMessages, data])
            }
        })

        axios.get(`/projects/get-projects/${location.state.project._id}`).then(res => {
            console.log(res.data.project)
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })

    }, [webContainer, webContainerReady])

  const saveFileTree=async(ft)=>{
    console.log("hi i am in save")
    try {
    const response=  await axios.put("/projects/update-file-tree",{
      projectId:project._id,
      fileTree:ft
    })

    console.log(response.data)
    } catch (error) {
       console.log(error)
    }
   
  }
 function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }
    function WriteAiMessage(message) {

        const messageObject = JSON.parse(message)

        return (
            <div
                className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
            >
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>)
    }
  //   useEffect(() => {
  // if (webContainer && pendingFileTree) {
  //   webContainer.mount(pendingFileTree)
  //   setPendingFileTree(null)
  // }
// }, [webContainer, pendingFileTree])
  if (!project) return <div className="text-center p-8">Loading project...</div>;

  return (
    <main className="h-screen w-screen flex">
      {/* LEFT SIDEBAR SECTION */}
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        {/* Top Header Buttons */}
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* Main conversation area */}
        

          {/* Side Panel for viewing collaborators */}
         <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
  <div
    ref={messageBox}
    className="message-box p-1 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide"
  >
    {messages.map((msg, index) => {
      console.log(msg)
      const isCurrentUser =  msg?.sender?.email?.toString() === user?.email?.toString();
      
      const isAI = msg.sender._id === 'ai';
      const isOtherUser = !isCurrentUser && !isAI;

      return (
        <div
          key={index}
          className={`message flex flex-col w-fit rounded-md max-w-80 p-2
            ${isCurrentUser ? 'ml-auto text-right bg-blue-100' : ''}
            ${isAI ? 'mr-auto text-left bg-green-100' : ''}
            ${isOtherUser ? 'mr-auto text-left bg-white' : ''}
          `}
        >
          <small className="opacity-65 text-xs">
            {isAI ? 'Gemini AI' : msg.sender.email}
          </small>
          <div className="text-sm">
            {isAI ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
          </div>
        </div>
      );
    })}
  </div>
</div>


          {/* Input and send button (You can add onClick logic later) */}
          <div className="inputField w-full flex absolute bottom-0">
            <input value={message} onChange={(e)=>setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none flex-grow  text-white bg-slate-800"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        
      </section>
        <section className="right  bg-red-50 flex-grow h-full flex">
            <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
              {/* mapping the fils which are comming from the ai */}
                    <div className="file-tree w-full">
                        {
                            Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                                    }}
                                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                    <p
                                        className='font-semibold text-lg'
                                    >{file}</p>
                                </button>))

                        }
                    </div>

                </div>
         <div className="code-editor flex flex-col flex-grow h-full shrink">
                        {/* the editor is divied into two parts bottom and top,, bottom is for showing the code and top is showing in which file are we there.. */}
                    <div className="top flex justify-between w-full">

                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                        <p
                                            className='font-semibold text-lg'
                                        >{file}</p>
                                    </button>
                                ))
                            }
                        </div>

                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                  if (!webContainer) {
                                        console.error("WebContainer is not ready yet");
                                        return;
                                    }
                                    // pushing the file structure in the web container.
                                    await webContainer.mount(fileTree)


                                    const installProcess = await webContainer.spawn("npm", [ "install" ])



                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })

                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>


                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>
               {iframeUrl && webContainer &&
                    (<div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                          {/* in which we can go to the another page by making the chnages */}
                            <input type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
                        </div>
                        <iframe
                        sandbox="allow-scripts allow-same-origin"
                         src={iframeUrl} className="w-full h-full"></iframe>
                    </div>)
                }


        </section>
      {/* Modal for adding collaborators */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${selectedUserId.has(user._id) ? 'bg-slate-200' : ''} p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
