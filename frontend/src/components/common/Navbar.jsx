import ProfileDropdown from "../ProfileDropdown";
import Logo from "./Logo";
import NavLink from "./NavLink";
import SearchBar from "./SearchBar";
import RightIcons from "./RightIcons";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-10">
          <Logo />
          <NavLink />
        </div>

        {/* CENTER */}
        <SearchBar />

        {/* RIGHT */}
        <RightIcons />
      </div>
    </nav>
  );
};

export default Navbar;
