import { useState } from 'react'
import stats from '../../assets/images/stats.png'
import title from '../../assets/images/stats_txt.png'
import pie from '../../assets/images/pie_chart.png'
import statsCenter from '../../assets/images/stats_center.png'
import SummonerSkillsCard from '../../components/Summoner/Skills'
import { useUserSummoners } from '../../state/user/hooks'
import { Summoner } from 'state/user/actions'
import SummonnerSkillDetailsCard from '../../components/Summoner/SkillsDetails'

export default function Skills(): JSX.Element | null {
    const summoners = useUserSummoners()

    const [selected, setSelected] = useState<Summoner>()

    return (
        <>
            <div className="w-full mb-44">
                <img alt="sword" src={stats} className="mx-auto w-16 mt-4 md:w-32" />
                <img alt="sword" src={title} className="mx-auto w-52 mt-4 md:w-64" />
            </div>
            <div className="w-full bg-custom-blue text-center pb-24">
                <img alt="sword" src={pie} className="mx-auto w-52 -m-32" />
                <img alt="sword" src={statsCenter} className="mx-auto w-52 mt-32 md:w-1/4 mb-8" />
                <span className="text-md md:text-2xl text-white">Select A Summoner And Upgrade Your Skills</span>
                {summoners ? (
                    summoners.length > 0 ? (
                        <>
                            {selected && (
                                <div className="w-10/12 xl:w-8/12 mx-auto mt-10 gap-4 mw-50">
                                    <SummonnerSkillDetailsCard summoner={selected} />
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-10/12 xl:w-8/12 mx-auto mt-10 gap-4 mw-50">
                                {summoners.map((summoner) => {
                                    return (
                                        <SummonerSkillsCard
                                            key={summoner.id}
                                            summoner={summoner}
                                            select={setSelected}
                                        />
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-white mt-10 text-2xl font-bold text-center">
                            To be able to manage skills, you need to have a summoner
                        </p>
                    )
                ) : (
                    <div />
                )}
            </div>
        </>
    )
}
