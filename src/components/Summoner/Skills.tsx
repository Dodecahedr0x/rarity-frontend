import { Summoner } from '../../state/user/actions'
import { CLASSES } from '../../constants/classes'
import useRarity from '../../hooks/useRarity'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { useCallback, useEffect, useState } from 'react'
import { fromWei } from 'web3-utils'
import useRarityAttributes from '../../hooks/useRarityAttributes'

interface SummonerSkillsCardProps {
    summoner: Summoner,
    select: (summoner: Summoner) => void
}

export default function SummonerSkillsCard({ summoner, select }: SummonerSkillsCardProps): JSX.Element {
    const { exp, levelUp } = useRarity()

    const { library, chainId } = useActiveWeb3React()

    const windowVisible = useIsWindowVisible()

    const [state, setState] = useState<{ actual: string; nextLvl: string }>({ actual: '0', nextLvl: '0' })

    const fetch = useCallback(async () => {
        const experience = await exp(summoner.id, summoner._level)
        setState({ actual: fromWei(experience.actual.toString()), nextLvl: fromWei(experience.next.toString()) })
    }, [setState, exp, summoner])

    useEffect(() => {
        if (!library || !windowVisible || !chainId || !exp) return
        fetch()
    }, [library, chainId, windowVisible, exp, fetch])

    const { scores, calcAP } = useRarityAttributes()

    const [availableAP, setAvailableAP] = useState(0)

    const [loaded, setLoaded] = useState(false)

    const [currAttrs, setCurrAttrs] = useState<{
        [k: string]: number
    }>({
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
    })

    const [tempAttrs, setTempAttrs] = useState<{
        [k: string]: number
    }>({
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
    })

    const fetchAttributes = useCallback(async () => {
        const attr = await scores(summoner.id)
        const AP = await calcAP(summoner.id, summoner._level)
        setCurrAttrs(attr)
        setAvailableAP(AP)
        setLoaded(true)
    }, [scores, calcAP, summoner])

    useEffect(() => {
        if (!library || !windowVisible || !chainId) return
        fetchAttributes()
    }, [library, chainId, windowVisible, fetchAttributes])

    useEffect(() => {
        if (loaded) {
            setTempAttrs(currAttrs)
        }
    }, [setTempAttrs, loaded, currAttrs, availableAP])

    function reset() {
        const newState = Object.assign(tempAttrs, currAttrs)
        setTempAttrs(newState)
    }

    return (
        <div className="w-full border-custom-border border-8 overflow-y-auto">
            <div className="grid grid-cols-1 gap-">
                <div className="p-4">
                    <div className="bg-custom-green mb-4 border-8 border-custom-border h-30 w-32 mx-auto">
                        <img
                            className="p-4 h-24 mx-auto"
                            src={CLASSES[summoner._class].image}
                            alt={CLASSES[summoner._class].name}
                        />
                    </div>
                    <div className="text-white bg-custom-blue px-2 text-xl border-2 border-solid w-32 mx-auto">
                        <h1>{CLASSES[summoner._class].name}</h1>
                    </div>
                </div>
                <div>
                    {
                        availableAP > 0
                            ? <button className="text-xs bg-custom-green border-2 rounded-lg border-white p-1 text-white" onClick={() => reset()}>Reset</button>
                            : <div/>
                    }
                </div>
                <div className="max-h-96 px-8 text-left text-white text-md font-bold">
                    <div className="flex justify-between items-center my-2">
                        <span>Summoner:</span>
                        <span>{parseInt(summoner.id, 16)}</span>
                    </div>
                    <div className="flex justify-between items-center my-2">
                        <span>Level:</span>
                        <span>
                            {parseInt(summoner._level, 16)}{' '}
                            <span className="text-xs">
                                ({state.actual}/{state.nextLvl})
                            </span>
                        </span>
                        {parseInt(state.actual) >= parseInt(state.nextLvl) ? (
                            <button
                                className="bg-custom-green border-2 rounded-md text-xs p-1"
                                onClick={async () => {
                                    await levelUp(summoner.id)
                                }}
                            >
                                Level UP
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        className="m-4 text-white uppercase font-bold bg-custom-green border-white border-2 rounded-lg text-lg  p-1"
                        onClick={() => {
                            select(summoner)
                        }}
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    )
}
