import { Atom } from "react-loading-indicators"

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Atom color="#1137b5" size="large" text="" textColor="#112dd7" />
    </div>
  )
}

export default LoadingSpinner
