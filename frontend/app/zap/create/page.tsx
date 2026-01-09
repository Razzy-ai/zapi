"use client"

import { Appbar } from "@/component/Appbar";
import { useEffect, useState } from "react";
import { ZapCell } from "@/component/ZapCell";
import { PrimaryButton } from "@/component/button/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/component/Input";

function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState([]);
    const [availableTriggers, setAvailableTriggers] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
            .then(x => {

                setAvailableTriggers(x.data.availableTriggers)
            })

        axios.get(`${BACKEND_URL}/api/v1/action/available`)
            .then(x => {

                setAvailableActions(x.data.availableActions)
            })
    }, [])

    return {
        availableActions,
        availableTriggers
    }
}



export default function Create() {

    const router = useRouter();
    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers()
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id: string;
        name: string
    }>();
    const [selectedActions, setSelectedActions] = useState<{
        index: number
        availableActionId: string;
        availableActionName: string;
        metadata: unknown
    }[]>([]);
    const [SelectedModalIndex, setSelectedModalIndex] = useState<null | number>(null);

    return <div>
        <Appbar />

        <div className="flex justify-end bg-slate-200 p-4">
            <PrimaryButton onClick={async () => {


                if (!selectedTrigger?.id) {
                    return;
                }

                const response = await axios.post(`${BACKEND_URL}/api/v1/zap`, {
                    "availableTriggerId": selectedTrigger.id,
                    "triggerMetadata": {},
                    "actions": selectedActions.map(a => ({
                        availableActionId: a.availableActionId,
                        actionMedata: a.metadata
                    }))

                }, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                })
                router.push("/dashboard")
            }}>Publish</PrimaryButton>
        </div>


        <div className="w-full min-h-screen h-screen bg-slate-200 flex flex-col justify-center">
            <div className="flex justify-center w-full">
                <ZapCell onClick={() => {
                    setSelectedModalIndex(1);
                }} name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"} index={1}></ZapCell>
            </div>

            <div className=" w-full pt-2 pb-2">
                {selectedActions.map((action, index) => <div key={action.index} className=" pt-2 flex justify-center">

                    <ZapCell onClick={() => {
                        setSelectedModalIndex(action.index);
                    }} name={action.availableActionName ? action.availableActionName : "Action"} index={action.index}></ZapCell> </div>)}

            </div>

            <div className="flex justify-center">
                <div>
                    <PrimaryButton onClick={() => {
                        setSelectedActions(a => [...a, {
                            index: a.length + 2,
                            availableActionId: "",
                            availableActionName: "",
                            metadata: {}
                        }])
                    }}>
                        <div className="text-2xl">
                            +
                        </div>
                    </PrimaryButton>
                </div>
            </div>
        </div>
        {SelectedModalIndex && <Modal availableItems={SelectedModalIndex === 1 ? availableTriggers : availableActions} onSelect={(props: null | { name: string; id: string; metadata: unknown }) => {

            if (props === null) {
                setSelectedModalIndex(null)
                return;
            }

            if (SelectedModalIndex === 1) {
                setSelectedTrigger({
                    id: props.id,
                    name: props.name
                })
            } else {
                setSelectedActions(a => {
                    const newActions = [...a];
                    newActions[SelectedModalIndex - 2] = {
                        index: SelectedModalIndex,
                        availableActionId: props.id,
                        availableActionName: props.name,
                        metadata: props.metadata
                    }
                    return newActions
                })
            }

            setSelectedModalIndex(null)

        }} index={SelectedModalIndex} />}
    </div>
}

function Modal({ index, onSelect, availableItems }: { index: number, onSelect: (props: null | { name: string; id: string; metadata: unknown }) => void, availableItems: { id: string, name: string, image: string }[] }) {

    const [step, setStep] = useState(0);
    const [selectedAction, setSelectedAction] = useState<{
        id: string,
        name: string
    }>();
    const isTrigger = index === 1;


    return <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-slate-200 bg-opacity-70 flex">
        <div className="relative p-4 w-full max-w-2xl max-h-full">

            <div className="relative bg-white rounded-lg shadow">

                <div className="flex items-center justify-between border-b rounded-t p-4 md:p-5">
                    <div className="text-xl">
                        Select {index === 1 ? "Trigger" : "Actions"}
                    </div>
                    <button onClick={() => {
                        onSelect(null)
                    }} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="static-modal">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" /></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>

                <div className="space-y-4 md:p-5 p-4">

                    {/* here u will get metadata from trigger */}
                    {step === 1 && selectedAction?.name === "email" && <EmailSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {(step === 1 && selectedAction?.name === "solana") && <SolanaSelector
                        setMetadata={(metadata) => {
                            onSelect({
                                ...selectedAction!,
                                metadata,
                            });
                        }}
                    />
                    }

                    {step === 0 && <div> {availableItems.map(({ id, name, image }, index) => {

                        return <div onClick={() => {
                            if (isTrigger) {

                                onSelect({
                                    id,
                                    name,
                                    metadata: {}
                                })
                            }
                            else {
                                setStep(s => s + 1)
                                setSelectedAction({
                                    id,
                                    name
                                })

                            }
                        }}
                            key={index}
                            className="flex border p-4 cursor-pointer hover:bg-slate-100">
                            <img src={image} width={30} className="rounded-full" /> <div className="flex flex-col justify-centre"> {name} </div>
                        </div>
                    })}  </div>}


                </div>
            </div>
        </div>
    </div>

}

function EmailSelector({ setMetadata }: {
    setMetadata: (params: unknown) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)} ></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
      
        <div className="pt-2">
        <PrimaryButton
            onClick={() => {

                setMetadata({
                    email,
                    body
                })
            }}
        >Submit</PrimaryButton>
        </div>
    </div>


}


function SolanaSelector({ setMetadata }: {
    setMetadata: (params: unknown) => void;
}) {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)} ></Input>
        <Input label={"Amount"} type={"text"} placeholder="Amount" onChange={(e) => setAmount(e.target.value)} ></Input>

       <div className="pt-4">

        <PrimaryButton
            onClick={() => {

                setMetadata({
                    amount,
                    address
                })
            }}
        >Submit</PrimaryButton>
       </div>

    </div>
}

