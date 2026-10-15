import CustomOrderForm from "@/components/home/CustomOrderForm";

export default function CustomOrder() {
  return (
    <section id="custom" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <div className="rounded-[2rem] bg-sand px-7 py-14 text-center sm:px-12 lg:px-20">
        <p className="text-[10px] font-medium tracking-[0.3em] text-umber">
          MADE JUST FOR YOU
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl italic leading-tight sm:text-5xl">
          Have a story in mind?
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
          Kami menerima pesanan custom untuk beberapa produk. Ceritakan ide Anda
          dan biarkan kami membantu mewujudkannya menjadi rajutan yang personal.
        </p>

        <CustomOrderForm />

        <p className="mt-4 text-[10px] text-[#806957]">
          Custom orders require confirmation and may have additional production
          time.
        </p>
      </div>
    </section>
  );
}
