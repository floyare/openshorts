const HomeWebsitesBox = ({ icons }: { icons: { url: string }[] }) => {
    return (
        <div className="grid grid-cols-9 grid-rows-4 gap-6 bg-white dark:bg-neutral-900 dark:border-neutral-700 p-4 rounded-md border-1 border-neutral-200">
            {icons.map((_, index) => (
                <a href={_.url} target="_blank" key={index} className="bg-neutral-400 rounded-sm hover:scale-105 transition-transform">
                    {/* <WebsiteIcon src={`https://s2.googleusercontent.com/s2/favicons?domain=${_.url}&sz=128`} alt="Website Icon" /> */}
                    <img src={`https://s2.googleusercontent.com/s2/favicons?domain=${_.url}&sz=128`} alt="Website Icon" width={48} height={48} className="h-12 w-12 object-contain rounded-sm" loading="lazy" />
                </a>
            ))}
        </div>
    );
}

export default HomeWebsitesBox;