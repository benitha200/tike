import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <div className="text-sm py-9 border-t">
      <div className="container flex justify-between items-center">
        <p className="text-slate-400">
          &copy; {new Date().getFullYear()} Tike. All rights reserved
        </p>
        <Image
          src={"/logo.svg"}
          className="h-5"
          width={100}
          height={100}
          alt=""
        />
        <div className="flex space-x-4 ">
          <Link href="#" className="text-slate-600 hover:text-slate-400">
            Terms of use
          </Link>
          <Link href="#" className="text-slate-600 hover:text-slate-400">
            Privacy policy
          </Link>
          <Link href="#" className="text-slate-600 hover:text-slate-400">
            Refund policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
