import { motion, useScroll, useTransform } from 'framer-motion';
import content from './content.json'
import { createElement } from 'react';
import YTPlayer from './YoutubePlayer';
import CarouselCustomArrows from './CarouselCustomArrows';


interface ProjectCardImageProps {
  name: string;
  description: string;
  link: string;
  image: string;
}
interface ProjectCardVideoProps {
  name: string;
  description: string;
  videoId: string;
}



const ProjectCardImage: React.FC<ProjectCardImageProps> = ({ name, description, link, image }) => {
  return <div  className="w-full h-full">
        <a className="block relative w-5/6 h-[63%] top-[6%]  mx-auto" href={link} target="_blank" rel="noopener noreferrer">
        <img
        src={image}
        alt="image 1"
        className="relative rounded-xl w-full h-full mx-auto object-cover"/>
        </a>
       <section className="relative text-xs sm:text-base md:text-lg lg:text-xl 3xl:text-2xl 4xl:text-3xl mx-auto font-exo px-4 top-[8%] text-white font-medium text-left w-5/6">
          <p className='pb-5'>{description}</p>
        </section>
      </div>
      ;
};

const ProjectCardVideo: React.FC<ProjectCardVideoProps> = ({ name, description, videoId }) => {
  return <div  className="w-full h-full">
        <YTPlayer videoId={videoId} youtubeProps={{opts: {height: '100%', width: '100%',playerVars: {autoplay: 1,}}}}
        className="relative rounded-xl w-5/6 h-[63%] top-[6%] mx-auto object-cover cursor-pointer"/>
       <section className="relative text-xs sm:text-base md:text-lg lg:text-xl 3xl:text-2xl 4xl:text-3xl mx-auto font-exo px-4 top-[8%] text-white font-medium text-left w-5/6">
          <p className='pb-5'>{description}</p>
        </section>
      </div>
      ;
};

const ProjectCardTypes: any = {
  image: ProjectCardImage,
  video: ProjectCardVideo
}

const createProjectCard = (component: React.ComponentType<any>, props: any) => {
  return createElement(component, props);
}; 

function ProjectsCard() {
    const { scrollYProgress } = useScroll();
    const yProgress = useTransform(
      scrollYProgress,
      [0.15, 0.4],
      [0, 1]
    );

    const zIndex = useTransform(
      scrollYProgress,
      [0.15, 0.4],
      [-10, 30]
    );

    const projectCards = content.ProjectCards.map(project => {
      return createProjectCard(ProjectCardTypes[project.type], project)
    })

  return (
    <motion.div style={{opacity: yProgress, zIndex: zIndex}}
    className="fixed flex items-center justify-center h-[100%] w-full top-0">
      <div className="card relative md:w-4/5 w-[90%] h-4/5 align-middle bg-black bg-opacity-80 place-content-center rounded-3xl text-center border-4 border-pink-800">
      <CarouselCustomArrows>
      {projectCards}
    </CarouselCustomArrows>
      </div>
    </motion.div>
  );
}

export default ProjectsCard;
