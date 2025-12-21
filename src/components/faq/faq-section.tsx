import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
    const faqData = [
        {
            value: "item-1",
            question: "What is openshorts.dev?",
            answer: "OpenShorts.dev is a curated directory of web tools and resources specifically designed for developers, designers, and content creators. The platform aggregates high-quality, often under-the-radar tools, ranging from AI generators and coding utilities to UI kits—that are frequently featured in tech content on platforms like YouTube Shorts and TikTok.",
        },
        {
            value: "item-2",
            question: "Is OpenShorts.dev free to use?",
            answer: "Yes, browsing the OpenShorts.dev directory is completely free. You do not need a subscription to access the list of tools. However, please note that while we list many free resources, some third-party tools linked in our directory may offer paid or premium plans on their own websites.",
        },
        {
            value: "item-4",
            question: "Who created OpenShorts.dev?",
            answer: "The platform was built and is maintained by floyare, a content creator and developer known for sharing useful tech tips and resource roundups on social media.",
        },
        {
            value: "item-5",
            question: "How often are new tools added?",
            answer: "To be completly honest, new tools are added whenever we come across something noteworthy or when our community suggests a tool. We strive to keep the directory fresh and relevant, so we encourage users to check back regularly for updates. If you have found a tool that you think should be included, don't hesitate and upload it using 'Upload' page.",
        },
        {
            value: "item-6",
            question: "Can I submit a tool to the directory?",
            answer: "We are always looking for innovative tools to feature. If you have developed a tool or found one that would benefit the creator community, navigate to the 'Upload' page and fill out the submission form. Please provide accurate information about the tool, including its features, and a valid URL.",
        },
        {
            value: "item-7",
            question: "A link on the website is broken. What should I do?",
            answer: "Because we link to external websites, occasionally a third-party tool may go offline or change its URL. If you encounter a 404 error, please report it using 'red flag icon' button, so we can update the directory immediately.",
        },
        {
            value: "item-8",
            question: "Do I need to create an account to view the tools?",
            answer: "No. OpenShorts.dev is a friction-free platform. We do not require you to sign up, log in, or provide an email address to browse the directory or access the external tools."
        },
        {
            value: "item-10",
            question: "What categories of tools are covered?",
            answer: "We focus on the modern creator stack. Our main categories include Artificial Intelligence (AI) generators, Frontend Development libraries, UI/UX Design resources, Video Editing assets, and Productivity utilities for freelancers."
        },
    ];

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full max-w-4xl py-6"
            defaultValue="item-1"
        >
            {
                faqData.map((item) => (
                    <AccordionItem
                        key={item.value}
                        value={item.value}
                    >
                        <AccordionTrigger
                            className="text-left font-medium"
                        >
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent
                            className="text-muted-foreground"
                        >
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))
            }
        </Accordion>
    );
}

export default FAQSection;