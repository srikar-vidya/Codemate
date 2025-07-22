import React, { useState, useEffect } from 'react'
import { useUser } from '../context/userContext'
import 'remixicon/fonts/remixicon.css';
import axios from "../config/axios"
import axiosInstance from "../config/axios";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [project, setProject] = useState([])

  const createProject = async (e) => {
    e.preventDefault()
    try {
      // Fix 1: Add 'await' here
      const response = await axios.post("/projects/create", {
        name: projectName
      })
      console.log(response.data)
      setProject(response.data.projects)
      setProjectName("") // Clear the input after creation
    } catch (error) {
      console.log(error)
    }
    finally {
      setIsModalOpen(false)
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/projects/all");
        console.log(response.data)
        setProject(response.data.projects);
      } catch (error) {
        console.log(error)
      }
    }
    fetchProjects()
  }, [])

  // Fix 2: Add error handling for navigation
  const handleProjectClick = (projectData) => {
    try {
      console.log('Navigating to project:', projectData); // Debug log
      navigate("/project", { state: { project: projectData } });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  return (
    <main className="p-4">
      <div className="projects flex gap-2">
        <button
          className="project p-4 border border-s-amber-200 rounded-md cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ri-links-fill"></i> New Project
        </button>
        {project.map((proj) => (
          <div
            key={proj._id}
            className="project p-4 cursor-pointer flex flex-col gap-2 border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => handleProjectClick(proj)}
          >
            <h2 className="font-semibold text-lg">{proj.name}</h2>
            <div className="flex gap-2 items-center text-sm text-gray-600">
              <i className="ri-user-line text-blue-600"></i>
              {proj.users?.length || 0} users
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home