import { useRaritySkillsContract } from './useContract'
import { useCallback } from 'react'
import { BASE_SKILLS_PER_CLASS, CLASS_SKILLS, SKILLS } from 'constants/skills'
import { Summoner } from 'state/user/actions'
import useRarityAttributes from './useRarityAttributes'

interface AttributesInterface {
    skillSet: (id: string) => Promise<{
        [key: string]: number
    }>
    calcSP: (summoner: Summoner) => Promise<number>
    setSkills: (id: string, skills: { [key: string]: number }) => Promise<void>
}

export default function useRaritySkills(): AttributesInterface {
    const skills = useRaritySkillsContract()
    const { scores } = useRarityAttributes()

    const skillsPerLevel = (summoner: Summoner, intelligence: number) => {
        const intMod = Math.floor((intelligence - 10) / 2)
        return (BASE_SKILLS_PER_CLASS[summoner._class] + intMod) * (Number(summoner._level) + 3)
    }

    const skillSet = useCallback(
        async (
            id: string
        ): Promise<{
            [key: string]: number
        }> => {
            try {
                const _skills: number[] = await skills?.get_skills(id)
                return Object.fromEntries(_skills.map((e, i) => [String(i + 1), e]))
            } catch (e) {
                return Object.fromEntries(
                    Array(Object.keys(SKILLS).length)
                        .fill(0)
                        .map((e, i) => [String(i + 1), 0])
                )
            }
        },
        [skills]
    )

    const calcSP = useCallback(
        async (summoner: Summoner): Promise<number> => {
            try {
                const { int } = await scores(summoner.id)
                const base = skillsPerLevel(summoner, int)
                const currentSkillSet: number[] = await skills?.get_skills(summoner.id)
                const currentSpentSP = currentSkillSet.reduce((previous, current, i) => {
                    if(CLASS_SKILLS[summoner._class].includes(String(i))) return previous + current
                    else return previous + current*2
                }, 0)
                return base - currentSpentSP
            } catch (e) {
                return 0
            }
        },
        [skills, scores]
    )

    const setSkills = useCallback(
        async (id: string, summonerSkill: { [key: string]: number }): Promise<void> => {
            try {
                await skills?.set_skill(id, Object.values(summonerSkill))
                return
            } catch (e) {
                return
            }
        },
        [skills]
    )

    return { skillSet, calcSP, setSkills }
}
