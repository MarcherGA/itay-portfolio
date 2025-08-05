import CenteredMultilineText from './centered-multiline-text'

type Props = {
  position?: [number, number, number],
  rotation?: [number, number, number]
}
export function BranchesText( {position, rotation} : Props) {

  return (
    <CenteredMultilineText text={"Welcome to\nItay's Island"} fontPath="/fonts/WorldMadlyTree2.typeface.json" texturePath="/textures/tree-texture.png" size={2} depth={0.3} lineHeight={2.2} position={position} rotation={rotation} color={"#9d5a14"} />
  )
}
