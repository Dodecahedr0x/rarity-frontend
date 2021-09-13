import { useUserSummoners } from '../../state/user/hooks'
import { Summoner } from '../../state/user/actions'
import { CLASSES } from '../../constants/classes'
import skills from '../../assets/images/skills.png'
import skills_txt from '../../assets/images/skills_text.png'
import { useState } from 'react'
import SummonerFactionsCard from '../../components/Summoner/Factions'
import useFactions from 'hooks/useFactions'

export default function Factions(): JSX.Element | null {
    const summoners = useUserSummoners()
    const { enrolled } = useFactions()

    const [summoner, setSummoner] = useState<Summoner | null>(null)

    function summonerDataToString(summoner: Summoner): string {
        return parseInt(summoner.id).toString() + ' Level ' + summoner._level + ' ' + CLASSES[summoner._class].name
    }

    return (
        <>
            <div className="w-full mb-44">
                <img alt="sword" src={skills} className="mx-auto w-16 mt-4 md:w-32" />
                <img alt="sword" src={skills_txt} className="mx-auto w-52 mt-4 md:w-64" />
            </div>
            <h1 className="text-md md:text-2xl text-white -mt-32 mb-12 uppercase">Assign your summoners to factions</h1>

            <div className="w-full bg-custom-blue text-center pb-24">
                <h2 className="text-md md:text-xl text-white m-4 uppercase">
                    {Object.values(enrolled || { 0: 0 }).reduce((prev, curr) => prev + curr, 0)} Summoners are already
                    enrolled in a faction
                </h2>
                <div className="mt-4">
                    <p className="w-full text-x text-white my-4">Select a summoner</p>
                    <select
                        className="p-2 border-custom-green border-4 rounded-lg"
                        onChange={(v) => {
                            setSummoner(JSON.parse(v.target.value))
                        }}
                    >
                        <option selected disabled hidden>
                            Select summoner
                        </option>
                        {summoners.map((summoner) => {
                            return (
                                <option key={summoner.id} value={JSON.stringify(summoner)}>
                                    {summonerDataToString(summoner)}
                                </option>
                            )
                        })}
                    </select>
                    {summoner ? (
                        <div className="w-10/12 xl:w-6/12 mx-auto mt-10 gap-4">
                            <SummonerFactionsCard summoner={summoner} />
                        </div>
                    ) : (
                        <p className="text-white mt-10 text-2xl font-bold text-center">Select a summoner first</p>
                    )}
                </div>
            </div>
        </>
    )
}
