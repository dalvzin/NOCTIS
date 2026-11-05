import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,describe,expect,it,vi} from 'vitest';
const sdk=vi.hoisted(()=>({signin:vi.fn(),signup:vi.fn(),reset:vi.fn(),google:vi.fn()}));
vi.mock('../services/supabase',async importOriginal=>{const original=await importOriginal<typeof import('../services/supabase')>();return {...original,supabase:{auth:{signInWithPassword:sdk.signin,signUp:sdk.signup,resetPasswordForEmail:sdk.reset,signInWithOAuth:sdk.google}}};});
import {AuthPage} from '../features/accounts/AuthPages';
afterEach(()=>{cleanup();vi.clearAllMocks();});
function open(){render(<MemoryRouter><AuthPage/></MemoryRouter>);}
describe('Authentication forms (no real emails or OAuth calls)',()=>{
 it('submits labeled sign-in fields and displays provider errors without claiming success',async()=>{
  sdk.signin.mockResolvedValueOnce({error:{message:'Invalid login credentials'}});const user=userEvent.setup();open();await user.type(screen.getByLabelText('Email'),'fixture@example.invalid');await user.type(screen.getByLabelText('Password'),'not-a-real-password');await user.click(screen.getByRole('button',{name:'Sign in'}));expect(await screen.findByRole('status')).toHaveTextContent('Invalid login credentials');expect(sdk.signin).toHaveBeenCalledWith({email:'fixture@example.invalid',password:'not-a-real-password'});
 });
 it('prepares verification and recovery redirects on this origin',async()=>{
  sdk.signup.mockResolvedValueOnce({error:null});sdk.reset.mockResolvedValueOnce({error:null});const user=userEvent.setup();open();await user.click(screen.getByRole('button',{name:'Create account'}));await user.type(screen.getByLabelText('Email'),'fixture@example.invalid');await user.type(screen.getByLabelText(/Password/),'not-a-real-password');await user.click(screen.getByRole('button',{name:'Create account'}));expect(await screen.findByRole('status')).toHaveTextContent('Check your email');expect(sdk.signup.mock.calls[0][0].options.emailRedirectTo).toBe(`${window.location.origin}/auth/callback`);
  await user.click(screen.getByRole('button',{name:'Forgot password?'}));await user.click(screen.getByRole('button',{name:'Send reset link'}));expect(sdk.reset.mock.calls[0][1].redirectTo).toBe(`${window.location.origin}/auth/recovery`);
 });
 it('uses the official Google provider and a same-origin callback',async()=>{
  sdk.google.mockResolvedValueOnce({error:{message:'Google provider not enabled'}});open();await userEvent.click(screen.getByRole('button',{name:'Continue with Google'}));expect(await screen.findByRole('status')).toHaveTextContent('Google provider not enabled');expect(sdk.google).toHaveBeenCalledWith({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback`}});
 });
});
