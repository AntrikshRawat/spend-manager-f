import React, { useState } from 'react'
import { HiPlus, HiMinus } from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'
import debounce from '../functions/debounce'
import axiosInstance from '../functions/axiosInstance'
import useUserStore from '../store/useUserStore'
import { toast } from 'react-toastify'

const createAccount = async (accountName, members) => {
  try{
    const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/account/create`, {
      acName: accountName,
      acMembers: members
    },{
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    toast.success(data?.message);
  }
  catch(err) {
    toast.error(err.response.data?.message?.[0]?.msg || err.response.data?.message || 'Failed to create account.');
  }
};

export default function CreateAccount() {
  const [accountName, setAccountName] = useState('')
  const [members, setMembers] = useState([{id:'',userName:''}])
  const [error, setError] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const {user} = useUserStore();
  const navigate = useNavigate();
  const [activeInputIndex, setActiveInputIndex] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [validUsernames, setValidUsernames] = useState(new Set())

  const filterList = (userlist, memberlist) => {
    return userlist.filter(item =>
      item.userName !== user.userName &&
      !memberlist.some(member => member.userName === item.userName)
    );
  };  
  const extractMemberIds = (members) => {
    return members
      .map(member => member.id)
      .filter(id => id !== undefined && id !== null && id !== '');
  };
  
  const searchUsers =
    debounce(async (query) => {
      if (!query.trim()) {
        setFilteredUsers([])
        setValidUsernames(new Set())
        return
      }
      try {
        setSearchLoading(true)
        const {data} = await axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/auth/v1/filter`, {
          params: { search: query }
        })
        const filtered = filterList(data.users,members)
        setFilteredUsers(filtered)
        setValidUsernames((prev) => new Set([...prev, ...filtered.map(user => user.userName)]));
      } catch (error) {
        console.error('Error searching users:', error)
        setFilteredUsers([])
        setValidUsernames(new Set())
      } finally {
        setSearchLoading(false)
      }
    }, 300);

  const handleMemberChange = (idx, value) => {
    const updated = [...members]
    updated[idx] = value
    setMembers(updated)
    setActiveInputIndex(idx)
    searchUsers(value)
  }

  const handleUserSelect = (user) => {
    const updated = [...members]
    updated[activeInputIndex] = {
      id:user._id,
      userName:user.userName
    }
    setMembers(updated)
    setFilteredUsers([])
  }

  const addMember = () => {
    if (members.length < 6) setMembers([...members, ''])
  }

  const removeMember = (idx) => {
    if (members.length > 1) setMembers(members.filter((_, i) => i !== idx))
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    if (!accountName.trim()) {
      setError('Account name is required.')
      return
    }
    if (members.some(m => typeof m.userName !== 'string' || !m.userName.trim())) {
      setError('All member fields must be filled.');
      return;
    }    
    // Check if all members have valid 
    const invalidMembers = members.filter(member => !validUsernames.has(member.userName))
    if (invalidMembers.length > 0) {
      setError('Please select valid usernames from the dropdown list.')
      return;
    }
    setError('');
    setCreateLoading(true);
    try {
      await createAccount(accountName,extractMemberIds(members)); 
      navigate('/my-accounts');
    }catch(err){
     toast.error(err.message[0].msg ||err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col gap-6"
      >
        <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Create New Account</h1>
        {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
            placeholder="Enter account name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Add Members (up to 6)</label>
          <div className="flex flex-col gap-3">
            {members.map((member, idx) => (
              <div key={idx} className="flex gap-2 items-center relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={member.userName}
                    onChange={e => handleMemberChange(idx, e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      member && !validUsernames.has(member) 
                        ? 'border-red-300 focus:ring-red-400' 
                        : 'border-gray-300 focus:ring-purple-400'
                    } focus:border-transparent outline-none transition`}
                    placeholder={`Member ${idx + 1} UserName`}
                    required
                  />
                  {activeInputIndex === idx && filteredUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-2 text-center text-gray-500">Loading...</div>
                      ) : (
                        filteredUsers.map((user, userIdx) => (
                          <div
                            key={userIdx}
                            className="px-4 py-2 hover:bg-purple-50 cursor-pointer"
                            onClick={() => handleUserSelect(user)}
                          >
                            {user.userName}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(idx)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition"
                    title="Remove member"
                  >
                    <HiMinus />
                  </button>
                )}
                {idx === members.length - 1 && members.length < 6 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 transition"
                    title="Add member"
                  >
                    <HiPlus />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <Link
            to="/my-accounts"
            className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-bold shadow hover:bg-gray-200 transition-all duration-200 text-lg text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createLoading}
            className={`flex-1 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg flex items-center justify-center ${createLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {createLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 