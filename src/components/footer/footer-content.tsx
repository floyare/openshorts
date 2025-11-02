const FooterContent = () => {
    return (
        <div className="text-sm text-text-500 dark:text-text-900 flex flex-col justify-center items-center py-2">
            <p className="px-2 font-semibold">
                openshorts.dev {new Date().getFullYear()}
            </p>
            <div className="flex justify-center items-center flex-wrap divide-x divide-transparent lg:divide-current relative bottom-0 z-[1001]">
                <a href="/tos" className="px-2"> Terms of Service </a>
                <a href="/privacy" className="px-2"> Privacy Policy </a>
                <a href="/about" className="px-2"> About the project </a>
            </div>
        </div>
    );
}

export default FooterContent;