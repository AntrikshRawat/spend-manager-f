import React, { useState } from 'react'
import { HiOutlineUserGroup, HiOutlineUser, HiOutlineTag, HiOutlineSearch, HiX } from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'
import debounce from '../functions/debounce'
import axiosInstance from '../functions/axiosInstance'
import useUserStore from '../store/useUserStore'
import { toast } from 'react-toastify'

const createAccount = async (accountName, members, accountType) => {
  try{
    const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/account/create`, {
      acName: accountName,
      acMembers: members,
      accountType
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
  const [members, setMembers] = useState([])
  const [memberQuery, setMemberQuery] = useState('')
  const [error, setError] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const user = useUserStore(u=>u.user);
  const navigate = useNavigate();
  const [searchLoading, setSearchLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [accountType, setAccountType] = useState('shared')

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
        return
      }
      try {
        setSearchLoading(true)
        const {data} = await axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/auth/v1/filter`, {
          params: { search: query }
        })
        const filtered = filterList(data.users,members)
        setFilteredUsers(filtered)
      } catch (error) {
        console.error('Error searching users:', error)
        setFilteredUsers([])
      } finally {
        setSearchLoading(false)
      }
    }, 300);

  const handleMemberSearchChange = (value) => {
    setMemberQuery(value)
    searchUsers(value)
  }

  const handleUserSelect = (user) => {
    if (members.length >= 10) return
    if (members.some(member => member.id === user._id)) return

    setMembers(prev => ([...prev, {
      id:user._id,
      userName:user.userName
    }]))
    setMemberQuery('')
    setFilteredUsers([])
  }

  const removeSelectedMember = (memberId) => {
    setMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    if (!accountName.trim()) {
      setError('Account name is required.')
      return
    }
    
    if (accountType === 'shared') {
      if (members.length === 0) {
        setError('Please select at least one member.');
        return;
      }    
      const invalidMembers = members.filter(member => !member.id)
      if (invalidMembers.length > 0) {
        setError('Please select valid usernames from the dropdown list.');
        return;
      }
      setError('');
      setCreateLoading(true);
      try {
        await createAccount(accountName, extractMemberIds(members), accountType); 
        navigate('/my-accounts');
      }catch(err){
       toast.error(err.message[0].msg ||err.message);
      } finally {
        setCreateLoading(false);
      }
    } else {
      // Personal account logic
      setError('');
      setCreateLoading(true);
      try {
        await createAccount(accountName, [], accountType);
        navigate('/my-accounts'); 
      } catch(err) {
        toast.error(err.message[0].msg || err.message);
      } finally {
        setCreateLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-12 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-visible">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <HiOutlineUserGroup className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Create New Account</h1>
                <p className="text-white/70 text-sm">Set up a personal or shared account</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Account Type Tabs */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountType('shared')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  accountType === 'shared'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <HiOutlineUserGroup className="w-4 h-4" />
                Shared
              </button>
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  accountType === 'personal'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <HiOutlineUser className="w-4 h-4" />
                Personal
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Account Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <HiOutlineTag className="w-4 h-4 text-gray-400" />
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
                placeholder="Enter account name"
                required
              />
            </div>

            {/* Members Section */}
            {accountType === 'shared' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <HiOutlineUserGroup className="w-4 h-4 text-gray-400" />
                    Members
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full ml-1">
                      {members.length}/10
                    </span>
                  </label>
                </div>

                <div className="relative border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                  <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={memberQuery}
                      onChange={e => handleMemberSearchChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-purple-500 bg-white focus:border-purple-500 outline-none transition-all text-sm"
                      placeholder="Search and select members..."
                      disabled={members.length >= 10}
                    />
                  </div>

                  {memberQuery.trim() && (
                    <div className="absolute z-[9999] left-4 right-4 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-56 overflow-y-auto overscroll-contain">
                      {searchLoading ? (
                        <div className="flex items-center justify-center gap-2 p-3">
                          <div className="w-4 h-4 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin"></div>
                          <span className="text-gray-500 text-sm">Searching...</span>
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user, userIdx) => (
                          <div
                            key={userIdx}
                            className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-2.5 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">
                                {user.userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-800 text-sm font-medium">{user.userName}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-sm text-gray-500">No users found</div>
                      )}
                    </div>
                  )}

                  {members.length > 0 && (
                    <div className="mt-3 border border-gray-200 bg-white rounded-xl p-3 space-y-2">
                      {members.map((member, idx) => (
                        <div key={member.id || idx} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-gray-100">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-white text-xs font-bold">
                                {member.userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-800 text-sm font-medium truncate">{member.userName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedMember(member.id)}
                            className="w-7 h-7 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0"
                            title={`Remove ${member.userName}`}
                            aria-label={`Remove ${member.userName}`}
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                to="/my-accounts"
                className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition-all duration-200 text-center text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createLoading}
                className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${createLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {createLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 