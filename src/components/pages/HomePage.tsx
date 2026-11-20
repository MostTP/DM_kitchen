import { foodImages } from "../../data/menu";
import type { RiceType, Screen } from "../../types";
import { BottomNav } from "../BottomNav";
import { Icon } from "../Icon";

interface HomePageProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  onSelectRice: (rice: RiceType) => void;
}

export function HomePage({ screen, onNavigate, onSelectRice }: HomePageProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden rounded-[30px] border-2 border-[#f3bd83] bg-[#fff6ec] min-[700px]:block min-[700px]:max-w-none min-[700px]:rounded-none min-[700px]:border-0 min-[700px]:bg-[#fffdfa]">
      <header className="fixed top-0 left-0 z-30 hidden h-[76px] w-full items-center justify-between bg-[#342820] px-[max(5vw,32px)] text-white min-[700px]:flex">
        <div className="flex items-center gap-[7px]">
          <div className="text-[25px] text-[#e6a64f]">♛</div>
          <div>
            <strong className="block text-[17px] tracking-[0.5px]">DMK</strong>
            <small className="block text-[7px] uppercase text-[#e8d9d0]">
              De_Mayor Kitchen
            </small>
          </div>
        </div>
        <nav
          className="flex items-center gap-[clamp(18px,3vw,42px)]"
          aria-label="Main navigation"
        >
          <button
            className="py-2.5 text-[13px] font-semibold text-[#f39a5a]"
            onClick={() => onNavigate("home")}
          >
            Home
          </button>
          <button
            className="py-2.5 text-[13px] font-semibold"
            onClick={() => onNavigate("menu")}
          >
            Our Menu
          </button>
          <button
            className="py-2.5 text-[13px] font-semibold"
            onClick={() => onNavigate("track")}
          >
            Track Order
          </button>
          <button
            className="flex items-center gap-2 rounded-[7px] border border-white/35 px-[15px] py-2.5 text-[13px] font-semibold"
            onClick={() => onNavigate("cart")}
          >
            <Icon name="cart" /> Cart
          </button>
        </nav>
      </header>

      <section className="relative mt-0 h-[414px] flex-none overflow-visible bg-[linear-gradient(180deg,rgba(10,7,5,0.72),rgba(11,8,5,0.14)_60%,rgba(12,8,5,0.2)),linear-gradient(90deg,rgba(9,6,4,0.88)_0%,rgba(10,7,4,0.6)_48%,rgba(10,7,4,0.04)_100%),url('https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=90')] bg-cover bg-[position:58%_center] after:absolute after:-bottom-[30px] after:-left-[9%] after:-right-[9%] after:z-0 after:h-[65px] after:rounded-[50%_50%_0_0/78%_78%_0_0] after:bg-[#fff6ec] after:content-[''] after:rotate-[2.3deg] max-[380px]:h-[395px] min-[700px]:mx-auto min-[700px]:mt-[104px] min-[700px]:h-[clamp(370px,36vw,470px)] min-[700px]:w-[min(1220px,calc(100%-64px))] min-[700px]:overflow-hidden min-[700px]:rounded-[24px] min-[700px]:bg-[linear-gradient(90deg,rgba(37,20,12,0.76)_0%,rgba(37,20,12,0.48)_45%,rgba(37,20,12,0.08)_100%),url('https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=90')] min-[700px]:bg-cover min-[700px]:bg-[position:center_55%] ">
        <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between px-[18px] text-[9px] font-bold text-white min-[700px]:hidden">
          <strong>9:41</strong>
          <span className="tracking-[1px]">▮▮▮ ▴ ▰</span>
        </div>
        <header className="absolute inset-x-0 top-9 z-10 flex h-[66px] items-center justify-between bg-transparent px-[21px] text-white min-[700px]:hidden">
          <div className="flex items-center gap-[7px]">
            <div className="text-[30px] leading-none text-[#ff9700]">♛</div>
            <div>
              <strong className="block text-[19px] leading-[1.1]">DMK</strong>
              <small className="block text-[8px] text-[#f1e4d7]">
                De_Mayor Kitchen
              </small>
            </div>
          </div>
          <button
            className="grid h-[38px] w-[38px] place-items-center text-white"
            aria-label="Menu"
          >
            <Icon name="menu" />
          </button>
        </header>
        <div className="absolute left-0 top-[120px] z-10 h-auto w-full px-[25px] py-2.5 text-white max-[380px]:top-[116px] max-[380px]:px-[21px] min-[700px]:top-0 min-[700px]:h-full min-[700px]:w-[60%] min-[700px]:px-[5.2%] min-[700px]:pt-[clamp(54px,6vw,82px)]">
          <p className="mb-[9px] whitespace-nowrap text-[clamp(18px,5.2vw,22px)] font-bold italic text-[#ff9200] max-[380px]:text-[clamp(16px,5vw,19px)] min-[700px]:mb-[18px] min-[700px]:text-[clamp(19px,1.8vw,25px)]">
            Delicious. Fresh. Satisfying.
          </p>
          <h1 className="m-0 text-[clamp(37px,10.8vw,43px)] font-[850] leading-[1.04] tracking-[-1.6px] max-[380px]:text-[34px] min-[700px]:font-serif min-[700px]:text-[clamp(58px,5.4vw,76px)] min-[700px]:leading-[0.98]">
            De_Mayor
            <br />
            <b className="text-[#ff7b00] min-[700px]:text-[#d66b34]">Kitchen</b>
          </h1>
          <span className="mt-[6px] block text-[14px] font-medium leading-[1.24] min-[700px]:mt-4 min-[700px]:text-[15px]">
            Your favourite meals,
            <br />
            made with love
          </span>
          <button
            className="mt-[15px] h-[43px] rounded-[15px] bg-[linear-gradient(105deg,#ff9700,#f05a05)] px-[17px] text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(219,74,0,0.22)] min-[700px]:mt-6 min-[700px]:h-12 min-[700px]:rounded-[7px] min-[700px]:px-5 min-[700px]:text-[13px]"
            onClick={() => onNavigate("menu")}
          >
            Order Now <b className="ml-3.5">→</b>
          </button>
        </div>
      </section>

      <section className="relative z-10 mt-[-1px] flex-none px-[10px] min-[700px]:mx-auto min-[700px]:mt-12 min-[700px]:max-w-[1220px] min-[700px]:px-5">
        <div className="mb-3 mt-[-2px] text-center min-[700px]:mb-5 min-[700px]:mt-0 min-[700px]:flex min-[700px]:items-end min-[700px]:justify-between min-[700px]:text-left">
          <div>
            <span className="mb-[5px] hidden text-[10px] font-extrabold tracking-[1.5px] text-dmk-orange min-[700px]:block">
              FRESH FROM OUR KITCHEN
            </span>
            <h2 className="m-0 text-[19px] font-extrabold text-[#211a17] min-[700px]:font-serif min-[700px]:text-[30px]">
              Our Menu
            </h2>
            <p className="mt-[5px] text-[11px] text-[#2f2924] min-[700px]:mt-1.5 min-[700px]:text-[13px] min-[700px]:text-[#8d8179]">
              Choose from our delicious rice packages
            </p>
          </div>
          <button
            className="hidden border-0 bg-transparent py-2.5 text-[13px] font-extrabold text-dmk-orange min-[700px]:block"
            onClick={() => onNavigate("menu")}
          >
            View full menu <b>→</b>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-[9px] min-[700px]:gap-5">
          <article className="relative min-w-0 overflow-hidden rounded-[15px] border border-[#f2e4d8] bg-gradient-to-b from-[#fffdfa] to-[#fffaf5] px-1.5 pb-[9px] pt-[5px] shadow-[0_2px_7px_rgba(65,36,18,0.1)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(66,39,22,0.12)] min-[700px]:rounded-2xl min-[700px]:border-[#eee6de] min-[700px]:p-3">
            <img
              className="h-[clamp(60px,18vw,72px)] w-full rounded-[11px] object-cover min-[700px]:h-[clamp(170px,18vw,235px)]"
              src={foodImages.jollof}
              alt="Jollof rice"
            />
            <h3 className="mx-[7px] mb-[3px] mt-[7px] text-xs font-bold text-[#16120f] min-[700px]:mb-[5px] min-[700px]:mt-[13px] min-[700px]:text-lg">
              Jollof Rice
            </h3>
            <p className="mx-[7px] mb-1 hidden text-[11px] text-[#81766f] min-[700px]:block">
              Classic Nigerian jollof rice.
            </p>
            <strong className="ml-[7px] block text-[11px] text-[#29211b] min-[700px]:text-xs">
              From ₦2,500
            </strong>
            <button
              className="absolute bottom-2 right-[7px] grid h-[26px] w-[26px] place-items-center rounded-full bg-gradient-to-br from-[#ff9a08] to-[#f45b14] text-[17px] font-extrabold text-white min-[700px]:bottom-3.5 min-[700px]:right-3.5 min-[700px]:h-[34px] min-[700px]:w-[34px]"
              aria-label="Add Jollof rice"
              onClick={() => {
                onSelectRice("Jollof Rice");
                onNavigate("customize");
              }}
            >
              +
            </button>
          </article>
          <article className="relative min-w-0 overflow-hidden rounded-[15px] border border-[#f2e4d8] bg-gradient-to-b from-[#fffdfa] to-[#fffaf5] px-1.5 pb-[9px] pt-[5px] shadow-[0_2px_7px_rgba(65,36,18,0.1)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(66,39,22,0.12)] min-[700px]:rounded-2xl min-[700px]:border-[#eee6de] min-[700px]:p-3">
            <img
              className="h-[clamp(60px,18vw,72px)] w-full rounded-[11px] object-cover min-[700px]:h-[clamp(170px,18vw,235px)]"
              src={foodImages.mixed}
              alt="Mixed rice"
            />
            <h3 className="mx-[7px] mb-[3px] mt-[7px] text-xs font-bold text-[#16120f] min-[700px]:mb-[5px] min-[700px]:mt-[13px] min-[700px]:text-lg">
              Mixed Rice
            </h3>
            <p className="mx-[7px] mb-1 hidden text-[11px] text-[#81766f] min-[700px]:block">
              A perfect blend of jollof and fried rice.
            </p>
            <strong className="ml-[7px] block text-[11px] text-[#29211b] min-[700px]:text-xs">
              From ₦2,500
            </strong>
            <button
              className="absolute bottom-2 right-[7px] grid h-[26px] w-[26px] place-items-center rounded-full bg-gradient-to-br from-[#ff9a08] to-[#f45b14] text-[17px] font-extrabold text-white min-[700px]:bottom-3.5 min-[700px]:right-3.5 min-[700px]:h-[34px] min-[700px]:w-[34px]"
              aria-label="Add mixed rice"
              onClick={() => {
                onSelectRice("Mixed Rice");
                onNavigate("customize");
              }}
            >
              +
            </button>
          </article>
        </div>
      </section>

      <section className="order-2 mx-2 mt-[10px] grid h-[82px] flex-none grid-cols-[105px_1fr] items-center gap-2 rounded-[13px] border border-[#ffbd70]/30 bg-[radial-gradient(ellipse_at_18%_55%,rgba(218,91,22,0.3),transparent_35%),linear-gradient(115deg,#21150e,#080705_70%,#25160b)] px-2.5 py-2 text-white shadow-[0_3px_8px_rgba(43,21,10,0.17)] min-[700px]:mx-auto min-[700px]:mt-6 min-[700px]:h-[100px] min-[700px]:max-w-[1180px] min-[700px]:grid-cols-[70px_1fr_auto] min-[700px]:gap-4 min-[700px]:rounded-xl min-[700px]:px-5 min-[700px]:py-[15px]">
        <div className="grid h-[60px] w-[88px] place-items-center rounded-[9px] text-[#ff8211] min-[700px]:h-16 min-[700px]:w-16 min-[700px]:rounded-lg min-[700px]:border min-[700px]:border-[#e89b4d] min-[700px]:bg-[#d95523]">
          <Icon name="truck" size={58} />
        </div>
        <div className="flex flex-col gap-px min-[700px]:gap-1">
          <strong className="text-[15px] leading-[1.1] min-[700px]:text-base">
            Feeding a crowd?
          </strong>
          <span className="text-[11px] leading-[1.2] min-[700px]:text-[11px]">
            Make your next gathering delicious.
          </span>
          <small className="mt-px text-[9px] text-[#f7c595] min-[700px]:mt-0.5">
            Bulk orders for 50+ plates
          </small>
        </div>
        <button
          className="hidden rounded-md bg-[#ef8c45] px-[18px] py-3 text-[11px] font-extrabold text-white min-[700px]:block"
          onClick={() => onNavigate("menu")}
        >
          Plan your order <b className="ml-2">→</b>
        </button>
      </section>

      <section className="order-3 mx-2 grid min-h-[54px] flex-none grid-cols-3 gap-0.5 rounded-none bg-transparent px-[3px] py-0.5 min-[700px]:mx-auto min-[700px]:mb-[22px] min-[700px]:mt-[30px] min-[700px]:max-w-[1180px] min-[700px]:rounded-[14px] min-[700px]:border min-[700px]:border-[#eee5dd] min-[700px]:bg-[#fffaf6] min-[700px]:px-[26px] min-[700px]:py-[22px]">
        <div className="grid grid-cols-[25px_1fr] items-center gap-1 min-[700px]:grid-cols-[42px_1fr] min-[700px]:gap-3">
          <span className="grid h-6 w-6 place-items-center text-xl text-[#f27412] min-[700px]:h-[38px] min-[700px]:w-[38px] min-[700px]:rounded-full min-[700px]:bg-[#fff0e7] min-[700px]:text-lg">
            ♨
          </span>
          <strong className="self-center text-[9px] leading-[1.05] text-[#2d2119] min-[700px]:text-xs">
            Freshly
            <br />
            Prepared
          </strong>
        </div>
        <div className="grid grid-cols-[25px_1fr] items-center gap-1 min-[700px]:grid-cols-[42px_1fr] min-[700px]:gap-3">
          <span className="grid h-6 w-6 place-items-center text-xl text-[#f27412] min-[700px]:h-[38px] min-[700px]:w-[38px] min-[700px]:rounded-full min-[700px]:bg-[#fff0e7] min-[700px]:text-lg">
            ✓
          </span>
          <strong className="self-center text-[9px] leading-[1.05] text-[#2d2119] min-[700px]:text-xs">
            Secure
            <br />
            Payment
          </strong>
        </div>
        <div className="grid grid-cols-[25px_1fr] items-center gap-1 min-[700px]:grid-cols-[42px_1fr] min-[700px]:gap-3">
          <span className="grid h-6 w-6 place-items-center text-xl text-[#f27412] min-[700px]:h-[38px] min-[700px]:w-[38px] min-[700px]:rounded-full min-[700px]:bg-[#fff0e7] min-[700px]:text-lg">
            ♧
          </span>
          <strong className="self-center text-[9px] leading-[1.05] text-[#2d2119] min-[700px]:text-xs">
            Fast
            <br />
            Delivery
          </strong>
        </div>
      </section>
      <BottomNav screen={screen} onNavigate={onNavigate} home />
    </div>
  );
}
