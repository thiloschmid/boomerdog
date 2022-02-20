import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import NavBar, { NavBarProps } from "../components/navbar";

export default {
    component: NavBar,
    title: "Navigation bar",
};

const Template: ComponentStory<typeof NavBar> = (args: NavBarProps) => (
    <Router>
        <NavBar {...args} />
    </Router>
);

export const Default = Template.bind({});
Default.args = {
    isConnected: true,
    isLoggedIn: true,
};
