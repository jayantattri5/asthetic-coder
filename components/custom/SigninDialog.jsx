import React, { useContext } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Lookup from "@/app/data/Lookup";
import { Button } from "../ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { UserDetailContext } from "./context/UserDetailContext";
import { useMutation } from "convex/react";
import uuid4 from "uuid4";
import { api } from "@/convex/_generated/api";

function SignInDialog({ openDialog, closeDialog }) {
const {userDetail, setUserDetail} = useContext(UserDetailContext);
console.log("UserDetailContext values:", { userDetail, setUserDetail });

const CreateUser = useMutation(api.users.CreateUser);
    
const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer '+ tokenResponse?.access_token } },
      );
  
      console.log(userInfo);
      const user = userInfo.data;
      await CreateUser ({
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        uid: uuid4()
    })

    if(typeof window !== 'undefined')
    {
        localStorage.setItem('user', JSON.stringify(user));

    }
        setUserDetail(userInfo?.data);
        //Save this inside the database
        closeDialog(false);
    },
    onError: errorResponse => console.log(errorResponse),
  });

    return (
        <Dialog open={openDialog} onOpenChange={closeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription className="flex flex-col items-center justify-center">
                        <div>
                            <h2 className="font-bold text-2xl text-white p-2">{Lookup.SIGNIN_HEADING}</h2>
                            <p className="mt-2 text-center p-2">{Lookup.SIGIN_SUBHADING}</p>
                            <Button variant="outline" className="mt-6 px-6"
                            onClick={googleLogin}>
                                Sign In with Google
                            </Button>
                            <p className="p-4">{Lookup?.SIGNIn_AGREEMENT_TEXT}</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Add your sign-in form here */}
                </div>
                <DialogFooter>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SignInDialog;