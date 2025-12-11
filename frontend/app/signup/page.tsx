"use client"
import { Appbar } from "@/component/Appbar"
import { useState } from "react"
import { PrimaryButton } from "@/component/button/PrimaryButton"
import { CheckFeature } from "@/component/CheckFeature"
import { Input } from "@/component/Input"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useRouter } from "next/router"


export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return <div>
        <Appbar />
        <div className="flex justify-center">
            <div className="flex pt-8 max-w-4xl">
                <div className="flex-1 pt-20 px-4">
                    <div className="font-semibold text-3xl pb-4">
                        Join millions worldwide who automate their work using Zapier.
                    </div>

                    <div className="pt-4 pb-6">
                        <CheckFeature label={"Easy setup, no coding required"} />
                    </div>
                    <div className="pb-6">
                        <CheckFeature label={"Free forever for core features"} />
                    </div>
                    <CheckFeature label={"14-day trail of premium features & apps"} />
                </div>
                <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
                    <Input label={"Name"}
                        onChange={e => {
                             setName(e.target.value)
                        }} type="text" placeholder="Your Name" />

                    <Input label={"Email"}
                        onChange={e => {
                            setEmail(e.target.value)
                        }} type="text" placeholder="Your Email" />

                    <Input label={"Password"}
                        onChange={e => {
                            setPassword(e.target.value)
                        }} type="password" placeholder="Password" />
                    <div className="pt-4">
                        <PrimaryButton onClick={async() => {
                            const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup` , {
                                username : email,
                                password,
                                name
                               });
                              router.push("/login")
                        }} size="big"> Get started free</PrimaryButton>
                    </div>
                </div>

            </div>
        </div>
    </div>

}