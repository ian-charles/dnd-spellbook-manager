# **Lean Product Requirements Document (PRD)**

**Product / Feature Name:**  
 **Author:**  
 **Date:**  
 **Status:** Draft / In Review / Approved

---

## **1\. Problem Statement**

Managing a spellbook in Dungeons & Dragons is hard\! There are literally *hundreds* of spells across all official DnD content, and that’s just in the Fifth Edition (5E) alone. Given that 

Many of the existing solutions for this need are insufficient: 

- **The Player’s Guide:** Contains all the information but is unwieldy to navigate and not tailorable to the player character  
- **Spell Cards:** Convenient but often printed in tiny text; flimsy if printed at home and costs \~$15 if purchased  
- **Homemade spreadsheets:** Lots of work to create, and also not so much of a “solution” as a DIY workaround  
- 

Additionally, while all of the issues above are true for players, they are exacerbated by an order of magnitude for DMs, who often need to manage multiple spellcasting monsters and/or NPCs at once.

---

## **2\. Goals & Success Metrics**

Define what success looks like.

* **Primary goal:**

* **Secondary goals:**

* **KPIs / success metrics:** Get 100 people to use the service

---

## **3\. Target Users & Use Cases**

Who are we building this for?

* **User personas:**  
  * DnD

* **Key use cases:**

  * *As a \[user\], I want to \[do something\] so that I can \[achieve an outcome\].*

---

## **4\. Solution Overview**

Summarize the proposed approach.

* One-paragraph description of the solution concept.

* Links to wireframes, diagrams, or design explorations.

* Key assumptions / trade-offs.

---

## **5\. Functional Requirements**

* Core user-facing capabilities.

* Edge cases and acceptance criteria.

| Feature | User Story | Importance | Acceptance Criteria | Notes |
| :---- | :---- | :---- | :---- | :---- |
| User Account Management | As a User, I want to be able to create an account with an email+password so that I can save my spellbooks to my account and retrieve them later. As a User, I want to be able to reset my account password so that I can regain access to my account if I lose it. | Medium-High | Implement OAuth? 🤷‍♂️ | Mostly this matters if we ever do server-side stuff and want to support people being able to access their stuff across multiple devices without sending a bunch of files back and forth. |
| Spell search and selection | As a User, I want to be able to easily navigate, search and filter the list of available spells based on various criteria so that I can effectively browse for the spells I want As a User, I want to be able to select spells both individually and as sets so that I can add them to a Spellbook | Mandatory | User can search/filter the set of all available spells based on any combination of the following criteria: Spell Name (partial string match) Spell Level (Integer range, min 0, max 9\) School of Magic ( Character Classes Components (individual  |  |
| Spell Information | As a User, I want to be able to view information on individual spells so that I can determine if they’re what I want to add to my spellbook |  | User can click into any individual spell in their search results and be taken to a spell info page Spell info page must contain the following information at minimum: Spell Name Spell Level School of Magic Classes Casting Time Range Components Duration Concentration Description Navigating to Spell Info page should not destroy state of the Spell Search and Selection |  |
| Spellbook CRUD | As a User, I want to be able create, delete, modify and retain multiple spells within my spellbook | Mandatory |  |  |
| Spellbook Library CRUD | As a Player, I want to be able to create, delete |  |  |  |
| Spellbook Export | As a User, I want to be  |  |  |  |
| Spellbook Display |  |  |  |  |
| Spellbook  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## General User Flows

### Creating a Spellbook (Client-side only app)

1. User on the main page, clicks “New Spellbook” button  
2. User is taken to   
3. User may perform the following actions in any order:  
   1. Give the spellbook a name (Spellbook Name field) (REQUIRED)  
   2. Search/filter available spells

Spellbook Object:

| Item | Description |
| :---- | :---- |
| Name | Human-readable spellbook name. Mu |
| Spells | Array-like entity containing Spell objects |
| Spellcasting Stat |  |
| Spell Attack Mod | Integer  |

Spell Object

- Spell Name  
- Classes  
- School  
- Concentration?  
- Duration  
- Range  
- Description

## **6\. Non-Functional Requirements**

### **Non-Functional**

* Performance targets

* Compliance / security

* Scalability / reliability

---

## **7\. Analytics & Validation Plan**

How we’ll confirm it’s successful.

* Metrics to track

* Experiment design (if applicable)

* Feedback collection

---

## **8\. Rollout Plan**

Implementation & release plan.

* Phased rollout or feature flag strategy

* Key dependencies

* Target milestones

---

## **9\. Open Questions & Risks**

Capture what’s uncertain.

* Outstanding assumptions

* Technical or adoption risks

* Mitigation ideas

