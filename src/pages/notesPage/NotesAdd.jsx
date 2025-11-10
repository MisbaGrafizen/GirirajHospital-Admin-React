
import React from 'react'
import CubaSidebar from '../../Component/sidebar/CubaSidebar'
import Preloader from '../../Component/loader/Preloader'
import NotesApp from '../../Component/notes/NotesApp'
import Header from '../../Component/header/Header'

export default function NotesAdd() {
    return (
        <>




            <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
                    <Header pageName="Notes" />
                    <div className="flex  w-[100%] h-[100%]">
                        <CubaSidebar />
                        <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[100px] m md11:!pb-[20px]     gap-[10px] ">
                            <Preloader />



                            <NotesApp />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
