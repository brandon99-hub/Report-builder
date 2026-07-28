import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import Home from "@/app/page"

describe("Home wizard flow", () => {
  it("renders main heading and create new card", () => {
    render(<Home />)

    expect(screen.getByText("Invoice Report Builder")).toBeInTheDocument()
    expect(screen.getByText("Create New")).toBeInTheDocument()
  })

  it("advances to template step when Create New is clicked", () => {
    render(<Home />)

    const createNew = screen.getByText("Create New")
    fireEvent.click(createNew)

    // Template selector should be visible
    expect(screen.getByText(/Select a template/i)).toBeInTheDocument()
  })
})


