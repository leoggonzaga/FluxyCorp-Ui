import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
    authenticationId?: string
    employeePublicId?: string
    companyTypeId?: string
    companyPublicId?: string
}

const initialState: UserState = {
    avatar: '',
    userName: '',
    email: '',
    authority: [],
    authenticationId: '',
    employeePublicId: '',
    companyTypeId: '',
    companyPublicId: '',
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.userName = action.payload?.userName
            state.authority = action.payload?.authority
            state.authenticationId = action.payload?.authenticationId
            state.employeePublicId = action.payload?.employeePublicId
            state.companyTypeId = action.payload?.companyTypeId
            state.companyPublicId = action.payload?.companyPublicId
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
