import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-2xl font-bold tracking-wide">
      <span className="text-amber-600 uppercase">Wearify</span>
    </Link>
  );
};

export default Logo;
