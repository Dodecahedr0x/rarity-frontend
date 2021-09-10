import { Summoner } from '../../state/user/actions'
import { CLASSES } from '../../constants/classes'
import useRarity from '../../hooks/useRarity'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { useCallback, useEffect, useState } from 'react'
import { fromWei } from 'web3-utils'
import { CLASS_SKILLS, SKILLS } from 'constants/skills'

import increase from '../../assets/images/increase_attribute.png'
import decrease from '../../assets/images/decrease_attribute.png'
import useRaritySkills from 'hooks/useRaritySkills'

interface SummonnerSkillDetailsCardProps {
    summoner: Summoner
}

export default function SummonnerSkillDetailsCard({ summoner }: SummonnerSkillDetailsCardProps): JSX.Element {
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

    const { skillSet, calcSP, setSkills } = useRaritySkills()

    const [availableSP, setAvailableSP] = useState(0)
    const [tempSP, setTempSP] = useState(0)

    const [loaded, setLoaded] = useState(false)

    const [currSkills, setCurrSkills] = useState<{
        [k: string]: number
    }>(
        Object.fromEntries(
            Array(Object.keys(SKILLS).length)
                .fill(0)
                .map((e, i) => [String(i + 1), 0])
        )
    )

    const [tempSkills, setTempSkills] = useState<{
        [k: string]: number
    }>(
        Object.fromEntries(
            Array(Object.keys(SKILLS).length)
                .fill(0)
                .map((e, i) => [String(i + 1), 0])
        )
    )

    const fetchSkillSet = useCallback(async () => {
        const SS = await skillSet(summoner.id)
        const SP = await calcSP(summoner)
        setCurrSkills(SS)
        setAvailableSP(SP)
        setLoaded(true)
    }, [calcSP, skillSet, summoner])

    useEffect(() => {
        if (!library || !windowVisible || !chainId) return
        fetchSkillSet()
    }, [library, chainId, windowVisible, fetchSkillSet])

    useEffect(() => {
        if (loaded) {
            setTempSkills(currSkills)
        }
    }, [setTempSkills, loaded, currSkills, availableSP])

    function calcTempSP() {
        let ap = availableSP
        for (const key of Object.keys(tempSkills)) ap -= tempSkills[key]

        setTempSP(ap)
    }

    function calcTempSPWithState(state: { [k: string]: number }): number {
        let ap = availableSP
        for (const key of Object.keys(state)) ap -= state[key]
        return ap
    }

    function handleAddition(attr: string) {
        const tempState = Object.assign({}, tempSkills, { [attr]: tempSkills[attr] + 1 })
        if (calcTempSPWithState(tempState) >= 0) {
            const addition = (tempSkills[attr] += 1)
            const newState = Object.assign({}, tempSkills, { [attr]: addition })
            setTempSkills(newState)
            calcTempSP()
        }
    }

    function handleSubstraction(attr: string) {
        if (currSkills[attr] <= tempSkills[attr] - 1) {
            const addition = (tempSkills[attr] -= 1)
            const newState = Object.assign({}, tempSkills, { [attr]: addition })
            setTempSkills(newState)
            calcTempSP()
        }
    }

    function reset() {
        const newState = Object.assign(tempSkills, currSkills)
        setTempSkills(newState)
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
                    {availableSP > 0 ? (
                        <button
                            className="text-xs bg-custom-green border-2 rounded-lg border-white p-1 text-white"
                            onClick={() => reset()}
                        >
                            Reset
                        </button>
                    ) : (
                        <div />
                    )}
                </div>
                <div className="px-8 text-left text-white text-md font-bold">
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
                    <div className="flex justify-between items-center">
                        <span className="my-2">
                            SP <span className="text-xs">(Unassigned):</span>
                        </span>
                        <span>{tempSP}</span>
                    </div>
                    {Object.values(SKILLS).map((skill, i) => {
                        const key = String(i + 1)
                        return (
                            <div key={key} className="flex justify-between items-center">
                                <span className="my-1">{skill.name}:</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm">{tempSkills[key]}</span>
                                    <button onClick={() => handleAddition(key)}>
                                        <img src={increase} width="20px" alt="increase attribute" />
                                    </button>
                                    <button onClick={() => handleSubstraction(key)}>
                                        <img src={decrease} width="20px" alt="decrease attribute" />
                                    </button>
                                    <span className="text-sm w-4">
                                        {CLASS_SKILLS[summoner._class].includes(key) ? 1 : 2}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-center">
                    <button
                        className="m-4 text-white uppercase font-bold bg-custom-green border-white border-2 rounded-lg text-lg  p-1"
                        onClick={() => {
                            setSkills(summoner.id, tempSkills)
                        }}
                    >
                        Assign Points
                    </button>
                </div>
            </div>
        </div>
    )
}
