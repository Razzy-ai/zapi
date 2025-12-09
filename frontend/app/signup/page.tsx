"use client"
import { Appbar } from "@/component/Appbar"
import { PrimaryButton } from "@/component/button/PrimaryButton"
import { CheckFeature } from "@/component/CheckFeature"
import { Input } from "@/component/Input"

export default function SignupPage() {
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

                        }} type="text" placeholder="Your Name" />

                    <Input label={"Email"}
                        onChange={e => {

                        }} type="text" placeholder="Your Email" />

                    <Input label={"Password"}
                        onChange={e => {

                        }} type="password" placeholder="Password" />
                    <div className="pt-4">
                        <PrimaryButton onClick={() => {

                        }} size="big"> Get started free</PrimaryButton>
                    </div>
                </div>

            </div>
        </div>
    </div>

}