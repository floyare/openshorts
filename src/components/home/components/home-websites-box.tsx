const HomeWebsitesBox = ({ icons }: { icons: { url: string }[] }) => {
    return (
        <div className="grid md:grid-cols-9 grid-cols-8 grid-rows-4 md:gap-5 gap-3 bg-white dark:bg-neutral-900 dark:border-neutral-700 p-4 corner-squircle rounded-md border-1 border-neutral-200">
            {icons.map((_, index) => (
                <a href={_.url} target="_blank" key={index} className="bg-neutral-400 corner-squircle rounded-sm hover:scale-105 transition-transform">
                    {/* <WebsiteIcon src={`https://s2.googleusercontent.com/s2/favicons?domain=${_.url}&sz=128`} alt="Website Icon" /> */}
                    <img src={`https://s2.googleusercontent.com/s2/favicons?domain=${_.url}&sz=128`} alt="Website Icon" width={48} height={48} className="md:h-12 md:w-12 h-8 w-8 object-contain corner-squircle rounded-sm" loading="lazy" />
                </a>
            ))}
        </div>
    );
}

export default HomeWebsitesBox;